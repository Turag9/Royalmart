import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create admin user
  const adminPassword = await bcrypt.hash('Mdturag 833250', 10);
  await prisma.user.upsert({
    where: { email: 'musabbirturag9@gmail.com' },
    update: {},
    create: {
      firstName: 'Musabbir',
      lastName: 'Turag',
      email: 'musabbirturag9@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created');

  // 2. Seed users from users.json
  const usersPath = resolve(__dirname, '../../users.json');
  if (!existsSync(usersPath)) {
    console.log('⚠️  users.json not found, skipping user seed');
  } else {
    const usersRaw = JSON.parse(readFileSync(usersPath, 'utf-8'));
    const usersData = usersRaw.slice(0, 50).map((u) => ({
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      password: u.password,
      phone: u.phone || null,
    }));

    for (const u of usersData) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: u,
      });
    }
    console.log(`✅ ${usersData.length} users seeded`);
  }

  // 3. Seed products and categories from products.json
  const productsPath = resolve(__dirname, '../../products.json');
  if (!existsSync(productsPath)) {
    console.log('⚠️  products.json not found, skipping product seed');
  } else {
    const productsRaw = JSON.parse(readFileSync(productsPath, 'utf-8'));
    const products = productsRaw.products;

  // 3. Seed products and categories from products.json
  const productsPath = resolve(__dirname, '../../products.json');
  if (!existsSync(productsPath)) {
    console.log('⚠️  products.json not found, skipping product seed');
  } else {
    const productsRaw = JSON.parse(readFileSync(productsPath, 'utf-8'));
    const products = productsRaw.products;

    // Extract unique categories
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

    // Seed products
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

    // 4. Seed reviews from products.json
    const allUsers = await prisma.user.findMany({ take: 50 });
    const allProducts = await prisma.product.findMany();

    let reviewCount = 0;
    for (const p of products) {
      if (!p.reviews?.length) continue;
      const dbProduct = allProducts.find((dp) => dp.sku === (p.sku || `SKU-${p.id}`));
      if (!dbProduct) continue;

      for (const r of p.reviews) {
        const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
        await prisma.review.create({
          data: {
            productId: dbProduct.id,
            userId: randomUser.id,
            rating: r.rating,
            comment: r.comment,
          },
        });
        reviewCount++;
      }
    }
    console.log(`✅ ${reviewCount} reviews seeded`);
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
