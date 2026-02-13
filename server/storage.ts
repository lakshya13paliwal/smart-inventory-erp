import { 
  db 
} from "./db";
import { 
  users, products, suppliers, sales, teamMembers,
  type User, type InsertUser,
  type Product, type InsertProduct, type UpdateProductRequest,
  type Supplier, type InsertSupplier,
  type TeamMember, type InsertTeamMember,
  type ForecastData
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getProducts(): Promise<(Product & { supplier: Supplier | null })[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: UpdateProductRequest): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(updates: UpdateSettingsRequest): Promise<Settings>;

  // Forecasting (Mock/Algorithm)
  getForecast(productId: number): Promise<ForecastData>;
}

export class DatabaseStorage implements IStorage {
  // === Auth ===
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // === Products ===
  async getProducts(): Promise<(Product & { supplier: Supplier | null })[]> {
    return await db.query.products.findMany({
      with: { supplier: true },
      orderBy: [desc(products.id)],
    });
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: UpdateProductRequest): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // === Suppliers ===
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  // === Team ===
  async getTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers);
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db.insert(teamMembers).values(member).returning();
    return newMember;
  }

  async deleteTeamMember(id: number): Promise<void> {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
  }

  // === Settings ===
  async getSettings(): Promise<Settings> {
    const [s] = await db.select().from(settings).limit(1);
    if (!s) {
      const [newSettings] = await db.insert(settings).values({}).returning();
      return newSettings;
    }
    return s;
  }

  async updateSettings(updates: UpdateSettingsRequest): Promise<Settings> {
    const current = await this.getSettings();
    const [updated] = await db
      .update(settings)
      .set(updates)
      .where(eq(settings.id, current.id))
      .returning();
    return updated;
  }

  // === Forecasting ===
  async getForecast(productId: number): Promise<ForecastData> {
    const product = await this.getProduct(productId);
    if (!product) throw new Error("Product not found");

    // Simulate historical data (Last 30 days)
    const historical = [];
    const today = new Date();
    let baseValue = 50 + Math.random() * 20;
    
    for (let i = 30; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      // Add some randomness and trend
      const noise = (Math.random() - 0.5) * 10;
      const trend = i * 0.2; // Slight upward trend
      baseValue = Math.max(10, baseValue + noise);
      historical.push({
        date: d.toISOString().split('T')[0],
        value: Math.round(baseValue + trend),
      });
    }

    // Simulate predictions (Next 7 days) - Simple Linear Projection + Seasonality
    const predicted = [];
    let lastValue = historical[historical.length - 1].value;
    
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      // Simulate "ML" prediction logic
      const trend = 0.5; // Assumed growth
      lastValue = lastValue + trend + (Math.random() - 0.5) * 5;
      predicted.push({
        date: d.toISOString().split('T')[0],
        value: Math.round(lastValue),
      });
    }

    // Determine recommendation
    const averageDemand = predicted.reduce((acc, curr) => acc + curr.value, 0) / predicted.length;
    let recommendation = "Stock Healthy";
    if (product.currentStock < averageDemand * 3) {
      recommendation = "Low Stock - Reorder Soon";
    }
    if (product.currentStock < product.reorderLevel) {
      recommendation = "CRITICAL: Reorder Immediately";
    }

    return {
      productId,
      productName: product.name,
      historical,
      predicted,
      confidence: 85 + Math.random() * 10, // Simulated confidence score
      recommendation,
    };
  }
}

export const storage = new DatabaseStorage();
