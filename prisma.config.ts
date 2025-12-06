import "dotenv/config";
import { defineConfig } from "@prisma/config";
import { config } from "dotenv";

// Load environment variables explicitly
config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please ensure your .env file contains DATABASE_URL."
  );
}

// Remove quotes if present (sometimes .env files have quoted values)
const cleanUrl = databaseUrl.replace(/^["']|["']$/g, '');

// Prisma 7 config format - datasource.url is read from environment
// The provider is defined in schema.prisma
export default defineConfig({
  datasource: {
    url: cleanUrl,
  }
});
