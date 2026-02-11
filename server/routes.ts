import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import pgSession from "connect-pg-simple";
import { pool } from "./db";

const scryptAsync = promisify(scrypt);

// Helper to hash passwords
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Helper to compare passwords
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === Auth Setup ===
  const PgSessionStore = pgSession(session);
  
  app.use(
    session({
      store: new PgSessionStore({
        pool,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: app.get("env") === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      }
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByEmail(username);
        if (!user) return done(null, false, { message: "Invalid email" });
        
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) return done(null, false, { message: "Invalid password" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Middleware to check auth
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  // === Auth Routes ===
  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({ ...input, password: hashedPassword });
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        next(err);
      }
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    res.json(req.user);
  });

  // === Product Routes ===
  app.get(api.products.list.path, isAuthenticated, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, isAuthenticated, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        throw err;
      }
    }
  });

  app.patch(api.products.update.path, isAuthenticated, async (req, res) => {
    const product = await storage.updateProduct(Number(req.params.id), req.body);
    res.json(product);
  });

  app.delete(api.products.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Supplier Routes ===
  app.get(api.suppliers.list.path, isAuthenticated, async (req, res) => {
    const suppliers = await storage.getSuppliers();
    res.json(suppliers);
  });

  app.post(api.suppliers.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.suppliers.create.input.parse(req.body);
      const supplier = await storage.createSupplier(input);
      res.status(201).json(supplier);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        throw err;
      }
    }
  });

  // === Forecast Routes ===
  app.get(api.forecasts.get.path, isAuthenticated, async (req, res) => {
    try {
      const forecast = await storage.getForecast(Number(req.params.productId));
      res.json(forecast);
    } catch (err) {
      res.status(404).json({ message: "Product not found" });
    }
  });

  // === Team Routes ===
  app.get(api.team.list.path, async (req, res) => {
    const members = await storage.getTeamMembers();
    res.json(members);
  });

  app.post(api.team.create.path, async (req, res) => {
    try {
      const input = api.team.create.input.parse(req.body);
      const member = await storage.createTeamMember(input);
      res.status(201).json(member);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        throw err;
      }
    }
  });
  
  app.delete(api.team.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteTeamMember(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Seeding ===
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const users = await storage.getUserByEmail("admin@erp.com");
  if (!users) {
    console.log("Seeding database...");
    
    // Create Admin
    const hashedPassword = await hashPassword("admin123");
    await storage.createUser({
      email: "admin@erp.com",
      password: hashedPassword,
      name: "System Admin",
      role: "admin"
    });

    // Create Suppliers (Indian Context)
    const s1 = await storage.createSupplier({
      name: "Tata Steel Ltd",
      contactPerson: "Rajesh Kumar",
      email: "supply@tatasteel.com",
      phone: "+91-9876543210",
      location: "Jamshedpur, Jharkhand",
      reliabilityScore: 95
    });

    const s2 = await storage.createSupplier({
      name: "Reliance Industries",
      contactPerson: "Amit Shah",
      email: "b2b@ril.com",
      phone: "+91-9988776655",
      location: "Mumbai, Maharashtra",
      reliabilityScore: 98
    });

    // Create Products
    await storage.createProduct({
      name: "Industrial Steel Sheets",
      sku: "STL-2024-001",
      category: "Raw Materials",
      description: "High grade steel sheets for manufacturing",
      currentStock: 500,
      reorderLevel: 100,
      unitPrice: "4500.00", // INR
      supplierId: s1.id
    });

    await storage.createProduct({
      name: "Polymer Granules",
      sku: "POL-2024-X99",
      category: "Plastics",
      description: "Premium quality polymer granules",
      currentStock: 45, // Low stock!
      reorderLevel: 100,
      unitPrice: "1250.50",
      supplierId: s2.id
    });

     await storage.createProduct({
      name: "Copper Wire Spools",
      sku: "COP-2024-W12",
      category: "Electronics",
      description: "Insulated copper wiring",
      currentStock: 2000,
      reorderLevel: 500,
      unitPrice: "850.00",
      supplierId: s1.id
    });

    console.log("Database seeded successfully!");
  }
}
