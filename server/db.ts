import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// Auto-create settings table for stability
pool.query(`
  CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY, 
    country TEXT NOT NULL DEFAULT 'India', 
    currency TEXT NOT NULL DEFAULT 'INR', 
    address_format TEXT NOT NULL DEFAULT 'IN', 
    organization_name TEXT NOT NULL DEFAULT 'Smart Inventory Systems'
  )
`).catch(e => console.error("Error creating settings table", e));

export const db = drizzle(pool, { schema });
