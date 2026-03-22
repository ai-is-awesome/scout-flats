import { config } from "dotenv";
import { resolve } from "node:path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Next.js injects env at runtime; tsx/scripts load this module before any other file runs
// config(), so .env must be loaded here (static imports are hoisted above deleteDb.ts body).
config({
  path: resolve(process.cwd(), ".env"),
  quiet: true,
});
config({
  path: resolve(process.cwd(), ".env.local"),
  override: true,
  quiet: true,
});

// If Node/pg logs SSL mode warnings about your DATABASE_URL, you can append either:
//   &uselibpqcompat=true&sslmode=require   (libpq-style, common for hosted Postgres)
//   or sslmode=verify-full                  (stricter; see pg-connection-string v3 notes)

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to property-search-app/.env or .env.local (cwd when running scripts)."
  );
}

// ETIMEDOUT = DB unreachable. Check: DATABASE_URL, DB running, firewall/IP allowlist, VPN, SSL.
const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 15_000,
  ...(process.env.DATABASE_SSL === "true" && {
    ssl: {
      rejectUnauthorized:
        process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
    },
  }),
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
