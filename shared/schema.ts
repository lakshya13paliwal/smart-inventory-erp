import { pgTable, text, serial, integer, boolean, timestamp, decimal, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Users for Authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Will be hashed
  name: text("name").notNull(),
  role: text("role").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  location: text("location"), // e.g., "Mumbai, Maharashtra"
  reliabilityScore: integer("reliability_score").default(100), // 0-100
});

// Products/Inventory
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  currentStock: integer("current_stock").notNull().default(0),
  reorderLevel: integer("reorder_level").notNull().default(10),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(), // In INR
  supplierId: integer("supplier_id").references(() => suppliers.id),
  lastRestocked: timestamp("last_restocked"),
});

// Sales History (for ML Forecasting)
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  saleDate: date("sale_date").defaultNow(),
});

// Team Members (for Credits Section)
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  enrollmentNumber: text("enrollment_number"),
  rollNumber: text("roll_number"),
  phoneNumber: text("phone_number"),
  email: text("email"),
});

// Enterprise Settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  country: text("country").notNull().default("India"),
  currency: text("currency").notNull().default("INR"),
  addressFormat: text("address_format").notNull().default("IN"),
  organizationName: text("organization_name").notNull().default("Smart Inventory Systems"),
});

// === RELATIONS ===
export const productsRelations = relations(products, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  sales: many(sales),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  product: one(products, {
    fields: [sales.productId],
    references: [products.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, lastRestocked: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true });
export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

// Auth
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginRequest = Pick<InsertUser, "email" | "password">;

// Products
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProductRequest = Partial<InsertProduct>;

// Suppliers
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

// Team
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

// Settings
export type Settings = typeof settings.$inferSelect;
export type UpdateSettingsRequest = Partial<Settings>;

// Forecasting
export interface ForecastData {
  productId: number;
  productName: string;
  historical: { date: string; value: number }[];
  predicted: { date: string; value: number }[];
  confidence: number;
  recommendation: string; // "Reorder Now", "Stock Healthy", etc.
}
