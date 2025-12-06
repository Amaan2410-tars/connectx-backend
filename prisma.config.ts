// Prisma Config for Prisma 7+
// This file configures Prisma CLI behavior
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
  },
});
