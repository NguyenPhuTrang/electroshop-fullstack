import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...");

  // =========================
  // Categories
  // =========================

  const smartphone = await prisma.category.upsert({
    where: {
      slug: "smartphones",
    },
    update: {},
    create: {
      name: "Smartphones",
      slug: "smartphones",
    },
  });

  const laptop = await prisma.category.upsert({
    where: {
      slug: "laptops",
    },
    update: {},
    create: {
      name: "Laptops",
      slug: "laptops",
    },
  });

  const headphone = await prisma.category.upsert({
    where: {
      slug: "headphones",
    },
    update: {},
    create: {
      name: "Headphones",
      slug: "headphones",
    },
  });

  // =========================
  // Brands
  // =========================

  const apple = await prisma.brand.upsert({
    where: {
      slug: "apple",
    },
    update: {},
    create: {
      name: "Apple",
      slug: "apple",
    },
  });

  const samsung = await prisma.brand.upsert({
    where: {
      slug: "samsung",
    },
    update: {},
    create: {
      name: "Samsung",
      slug: "samsung",
    },
  });

  const sony = await prisma.brand.upsert({
    where: {
      slug: "sony",
    },
    update: {},
    create: {
      name: "Sony",
      slug: "sony",
    },
  });

  // =========================
  // Products
  // =========================

  await prisma.product.upsert({
    where: {
      sku: "IPHONE-16-128",
    },
    update: {},
    create: {
      name: "iPhone 16",
      slug: "iphone-16",
      sku: "IPHONE-16-128",
      description: "Apple iPhone 16 128GB",
      price: 25000000,
      stock: 50,
      categoryId: smartphone.id,
      brandId: apple.id,

      images: {
        create: [
          {
            url: "https://example.com/images/iphone-16.jpg",
            alt: "iPhone 16",
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: {
      sku: "MACBOOK-AIR-M4",
    },
    update: {},
    create: {
      name: "MacBook Air M4",
      slug: "macbook-air-m4",
      sku: "MACBOOK-AIR-M4",
      description: "Apple MacBook Air M4",
      price: 30000000,
      stock: 30,
      categoryId: laptop.id,
      brandId: apple.id,

      images: {
        create: [
          {
            url: "https://example.com/images/macbook-air-m4.jpg",
            alt: "MacBook Air M4",
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: {
      sku: "GALAXY-S25",
    },
    update: {},
    create: {
      name: "Samsung Galaxy S25",
      slug: "samsung-galaxy-s25",
      sku: "GALAXY-S25",
      description: "Samsung Galaxy S25",
      price: 22000000,
      stock: 40,
      categoryId: smartphone.id,
      brandId: samsung.id,

      images: {
        create: [
          {
            url: "https://example.com/images/galaxy-s25.jpg",
            alt: "Samsung Galaxy S25",
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: {
      sku: "SONY-XM5",
    },
    update: {},
    create: {
      name: "Sony WH-1000XM5",
      slug: "sony-wh-1000xm5",
      sku: "SONY-XM5",
      description: "Sony WH-1000XM5 Wireless Headphones",
      price: 8000000,
      stock: 25,
      categoryId: headphone.id,
      brandId: sony.id,

      images: {
        create: [
          {
            url: "https://example.com/images/sony-xm5.jpg",
            alt: "Sony WH-1000XM5",
          },
        ],
      },
    },
  });

  console.log("✅ Database seed completed!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });