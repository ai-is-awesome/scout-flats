import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Migrations and introspection need a direct Postgres URL.
 * When DATABASE_URL is Prisma Accelerate (prisma:// or prisma+postgres://),
 * set DIRECT_DATABASE_URL to your real PostgreSQL connection string.
 */
function migrationDatasourceUrl(): string {
  const main = process.env.DATABASE_URL;
  if (!main) {
    throw new Error("DATABASE_URL is not set.");
  }
  const accelerate =
    main.startsWith("prisma://") || main.startsWith("prisma+postgres://");
  if (accelerate) {
    const direct = process.env.DIRECT_DATABASE_URL;
    if (!direct) {
      throw new Error(
        "DIRECT_DATABASE_URL must be set to a postgresql:// URL when DATABASE_URL uses Prisma Accelerate (migrations cannot use the Accelerate URL)."
      );
    }
    return direct;
  }
  return main;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationDatasourceUrl(),
  },
});
