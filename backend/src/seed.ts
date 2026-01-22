import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultTemplates = [
  {
    name: 'Abroad',
    description: 'Complete checklist for international travel',
    icon: '✈️',
    items: [
      { name: 'Passport', category: 'Documents' },
      { name: 'Visa (if required)', category: 'Documents' },
      { name: 'Travel insurance documents', category: 'Documents' },
      { name: 'Flight tickets / booking confirmation', category: 'Documents' },
      { name: 'Hotel reservation', category: 'Documents' },
      { name: 'Copies of important documents', category: 'Documents' },
      { name: 'Credit/debit cards', category: 'Money' },
      { name: 'Foreign currency', category: 'Money' },
      { name: 'Phone charger', category: 'Electronics' },
      { name: 'Power adapter/converter', category: 'Electronics' },
      { name: 'Camera', category: 'Electronics' },
      { name: 'Headphones', category: 'Electronics' },
      { name: 'Clothes for the trip', category: 'Clothing' },
      { name: 'Underwear & socks', category: 'Clothing' },
      { name: 'Comfortable shoes', category: 'Clothing' },
      { name: 'Weather-appropriate outerwear', category: 'Clothing' },
      { name: 'Toiletries bag', category: 'Toiletries' },
      { name: 'Toothbrush & toothpaste', category: 'Toiletries' },
      { name: 'Deodorant', category: 'Toiletries' },
      { name: 'Medications', category: 'Health' },
      { name: 'First aid kit', category: 'Health' },
      { name: 'Sunscreen', category: 'Health' },
      { name: 'Sunglasses', category: 'Accessories' },
      { name: 'Travel pillow', category: 'Accessories' },
      { name: 'Luggage locks', category: 'Accessories' },
    ],
  },
  {
    name: 'Day Trip',
    description: 'Essentials for a one-day adventure',
    icon: '🚗',
    items: [
      { name: 'Water bottle', category: 'Food & Drink' },
      { name: 'Snacks', category: 'Food & Drink' },
      { name: 'Phone', category: 'Electronics' },
      { name: 'Phone charger / power bank', category: 'Electronics' },
      { name: 'Wallet', category: 'Essentials' },
      { name: 'ID card', category: 'Essentials' },
      { name: 'Keys', category: 'Essentials' },
      { name: 'Sunglasses', category: 'Accessories' },
      { name: 'Sunscreen', category: 'Health' },
      { name: 'Comfortable shoes', category: 'Clothing' },
      { name: 'Weather-appropriate jacket', category: 'Clothing' },
      { name: 'Map / GPS', category: 'Navigation' },
      { name: 'Camera', category: 'Electronics' },
      { name: 'Umbrella (if needed)', category: 'Weather' },
    ],
  },
  {
    name: 'Overnight',
    description: 'Pack list for overnight stays',
    icon: '🌙',
    items: [
      { name: 'Change of clothes', category: 'Clothing' },
      { name: 'Underwear', category: 'Clothing' },
      { name: 'Socks', category: 'Clothing' },
      { name: 'Pajamas', category: 'Clothing' },
      { name: 'Toiletries bag', category: 'Toiletries' },
      { name: 'Toothbrush & toothpaste', category: 'Toiletries' },
      { name: 'Deodorant', category: 'Toiletries' },
      { name: 'Phone charger', category: 'Electronics' },
      { name: 'Phone', category: 'Electronics' },
      { name: 'Wallet', category: 'Essentials' },
      { name: 'ID card', category: 'Essentials' },
      { name: 'Keys', category: 'Essentials' },
      { name: 'Medications (if any)', category: 'Health' },
      { name: 'Book or entertainment', category: 'Entertainment' },
      { name: 'Snacks', category: 'Food & Drink' },
    ],
  },
];

async function seed() {
  console.log('Seeding database...');

  // Check if templates already exist
  const existingTemplates = await prisma.checklistTemplate.findMany({
    where: { isDefault: true },
  });

  if (existingTemplates.length > 0) {
    console.log('Default templates already exist. Skipping seed.');
    return;
  }

  // Create default templates
  for (const template of defaultTemplates) {
    await prisma.checklistTemplate.create({
      data: {
        name: template.name,
        description: template.description,
        icon: template.icon,
        isDefault: true,
        items: {
          create: template.items.map((item, index) => ({
            name: item.name,
            category: item.category,
            orderIndex: index,
          })),
        },
      },
    });
    console.log(`Created template: ${template.name}`);
  }

  console.log('Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
