// Prisma CLI config (migrate, studio). The app itself connects through PrismaService.
import "dotenv/config";
import { defineConfig } from "prisma/config";

/** Builds the connection URL from the same DB_* keys the app uses (see src/config/env.schema.ts). */
function databaseUrl(): string {
  const e = process.env;
  const user = encodeURIComponent(e.DB_USERNAME ?? "");
  const password = encodeURIComponent(e.DB_PASSWORD ?? "");
  return `postgresql://${user}:${password}@${e.DB_HOST}:${e.DB_PORT ?? 5432}/${e.DB_DATABASE}?schema=public`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl(),
  },
});
