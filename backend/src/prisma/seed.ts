import { PrismaClient } from '@prisma/client';
import { seedCategoriesForGroup } from '../utils/seedCategories';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo group
  const demoGroup = await prisma.group.upsert({
    where: { id: '00000000-0000-4000-a000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-a000-000000000001',
      name: 'Demo Household',
      isDemo: true,
      persons: {
        create: [
          { name: 'Demo Person A' },
          { name: 'Demo Person B' },
        ],
      },
    },
  });

  console.log('Created demo group:', demoGroup.name);

  // Seed categories for demo group (force update to ensure new categories)
  await seedCategoriesForGroup(demoGroup.id, true);

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

