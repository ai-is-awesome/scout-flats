import { config } from "dotenv";
import { resolve } from "node:path";
import { PrismaClient } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

type AppPrismaClient = InstanceType<typeof PrismaClient>;

config({
  path: resolve(process.cwd(), ".env"),
  quiet: true,
});
config({
  path: resolve(process.cwd(), ".env.local"),
  override: true,
  quiet: true,
});

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to property-search-app/.env or .env.local (cwd when running scripts)."
    );
  }
  return url;
}

const databaseUrl = requireDatabaseUrl();

function isAccelerateUrl(url: string): boolean {
  return (
    url.startsWith("prisma://") || url.startsWith("prisma+postgres://")
  );
}

const globalForPrisma = globalThis as unknown as {
  prisma: AppPrismaClient | undefined;
};

function createPrisma(): AppPrismaClient {
  if (isAccelerateUrl(databaseUrl)) {
    return new PrismaClient({
      accelerateUrl: databaseUrl,
    }).$extends(withAccelerate()) as unknown as AppPrismaClient;
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 15_000,
    ...(process.env.DATABASE_SSL === "true" && {
      ssl: {
        rejectUnauthorized:
          process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
      },
    }),
  });

  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

export const prisma: AppPrismaClient =
  globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
