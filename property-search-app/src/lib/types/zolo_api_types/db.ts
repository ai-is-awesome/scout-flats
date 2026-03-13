import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
console.log("Connection string: ", connectionString);
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// ETIMEDOUT = DB unreachable. Check: DATABASE_URL, DB running, firewall/IP allowlist, VPN, SSL.
const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 15_000,
  ...(process.env.DATABASE_SSL === "true" && {
    ssl: { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false" },
  }),
});


const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

