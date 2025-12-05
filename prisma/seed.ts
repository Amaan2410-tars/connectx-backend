import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

async function main() {
  console.log("Seeding coin bundles...");

  // Seed coin bundles
  const bundles = [
    { amountINR: 10, coins: 100 },
    { amountINR: 20, coins: 250 },
    { amountINR: 50, coins: 700 },
    { amountINR: 100, coins: 1500 },
  ];

  for (const bundle of bundles) {
    const existing = await prisma.coinBundle.findFirst({
      where: {
        amountINR: bundle.amountINR,
        coins: bundle.coins,
      },
    });

    if (!existing) {
      await prisma.coinBundle.create({
        data: bundle,
      });
      console.log(`Created bundle: ₹${bundle.amountINR} = ${bundle.coins} coins`);
    } else {
      console.log(`Bundle already exists: ₹${bundle.amountINR} = ${bundle.coins} coins`);
    }
  }

  console.log("Coin bundles seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

