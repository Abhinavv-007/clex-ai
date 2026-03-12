import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a dev user
  const user = await prisma.user.upsert({
    where: { email: 'dev@clex.in' },
    update: {},
    create: {
      id: 'dev-user-id',
      email: 'dev@clex.in',
      name: 'Dev User',
      planTier: 'pro',
    },
  });

  console.log(`✅ User: ${user.email} (${user.id})`);

  // Create a dev API key: clex_dev_test_key_1234567890
  const rawKey = 'clex_dev_test_key_1234567890abcdefghijklmnop';
  const keyHash = await bcrypt.hash(rawKey, 12);

  const apiKey = await prisma.apiKey.upsert({
    where: { keyHash },
    update: {},
    create: {
      userId: user.id,
      name: 'Development Key',
      keyHash,
      keyPrefix: rawKey.slice(0, 12),
    },
  });

  console.log(`✅ API Key: ${rawKey.slice(0, 12)}... (${apiKey.id})`);
  console.log(`   Full key for testing: ${rawKey}`);

  // Create some sample usage records
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    await prisma.usageRecord.upsert({
      where: {
        userId_date_model: {
          userId: user.id,
          date,
          model: 'meta/llama-3.3-70b-instruct',
        },
      },
      update: {},
      create: {
        userId: user.id,
        date,
        model: 'meta/llama-3.3-70b-instruct',
        totalRequests: Math.floor(Math.random() * 100) + 10,
        totalTokens: Math.floor(Math.random() * 50000) + 5000,
        totalCost: Math.random() * 0.5,
      },
    });
  }

  console.log('✅ Sample usage records created');
  console.log('\n🎉 Seed complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
