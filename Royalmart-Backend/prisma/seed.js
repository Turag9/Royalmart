import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function hashPassword(password) {
  return bcrypt.hash(String(password), 10);
}

async function main() {
  console.log('Seeding database...');

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const adminPassword = await hashPassword(process.env.ADMIN_PASSWORD);
    await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL.toLowerCase() },
      update: { password: adminPassword, role: 'ADMIN' },
      create: {
        firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
        lastName: process.env.ADMIN_LAST_NAME || null,
        email: process.env.ADMIN_EMAIL.toLowerCase(),
        password: adminPassword,
        role: 'ADMIN',
      },
    });
    console.log('Admin user seeded');
  } else {
    console.log('ADMIN_EMAIL or ADMIN_PASSWORD missing, skipping admin seed');
  }

  const usersPath = resolve(__dirname, '../../users.json');
  if (!existsSync(usersPath)) {
    console.log('users.json not found, skipping user seed');
  } else {
    const usersRaw = JSON.parse(readFileSync(usersPath, 'utf-8'));
    const usersData = usersRaw.slice(0, 50);

    for (const sourceUser of usersData) {
      const password = await hashPassword(sourceUser.password || 'password123');
      await prisma.user.upsert({
        where: { email: sourceUser.email.toLowerCase() },
        update: {},
        create: {
          id: sourceUser.id,
          firstName: sourceUser.first_name,
          lastName: sourceUser.last_name,
          email: sourceUser.email.toLowerCase(),
          password,
          phone: sourceUser.phone || null,
        },
      });
    }
    console.log(`✅ ${usersData.length} users seeded`);
  }

  const productsPath = resolve(__dirname, '../../products.json');
  if (!existsSync(productsPath)) {
    console.log('products.json not found, skipping product seed');
  } else {
    const productsRaw = JSON.parse(readFileSync(productsPath, 'utf-8'));
    const products = productsRaw.products;

    const categoryNames = [...new Set(products.map((p) => p.category))];
    const categoryMap = {};

    for (const name of categoryNames) {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const cat = await prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name, slug },
      });
      categoryMap[name] = cat.id;
    }
    console.log(`✅ ${categoryNames.length} categories seeded`);

    for (const p of products) {
      await prisma.product.upsert({
        where: { sku: p.sku || `SKU-${p.id}` },
        update: {},
        create: {
          title: p.title,
          description: p.description,
          price: p.price,
          discountPercentage: p.discountPercentage || 0,
          rating: p.rating || 0,
          brand: p.brand || null,
          sku: p.sku || `SKU-${p.id}`,
          thumbnail: p.thumbnail,
          images: p.images || [],
          stock: p.stock || 0,
          categoryId: categoryMap[p.category] || null,
        },
      });
    }
    console.log(`✅ ${products.length} products seeded`);

    const allUsers = await prisma.user.findMany({ take: 50 });
    const allProducts = await prisma.product.findMany();

    let reviewCount = 0;
    for (const product of products) {
      if (!product.reviews?.length || !allUsers.length) continue;

      const dbProduct = allProducts.find((dp) => dp.sku === (product.sku || `SKU-${product.id}`));
      if (!dbProduct) continue;

      for (const review of product.reviews) {
        const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
        await prisma.review.create({
          data: {
            productId: dbProduct.id,
            userId: randomUser.id,
            rating: review.rating,
            comment: review.comment,
          },
        });
        reviewCount++;
      }
    }
    console.log(`✅ ${reviewCount} reviews seeded`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
