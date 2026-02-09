import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Predefined category structure
const categories = [
  {
    mainCategory: 'Alimentos',
    subCategories: [
      'Mercado',
      'Restaurants',
      'Rappi',
      'Snacks',
      'Alcohol',
      'Carne',
      'Verduras/Frutas',
    ],
  },
  {
    mainCategory: 'Servicios',
    subCategories: [
      'Arriendo',
      'Electricidad',
      'Internet',
      'Gas',
      'Agua',
      'Lavanderia',
      'Otros servicios',
    ],
  },
  {
    mainCategory: 'Transporte',
    subCategories: [
      'Gasolina',
      'Taxis',
      'Parking',
      'Seguro Auto',
      'Credito Auto',
      'Mantenimiento Auto',
      'Impuesto Auto',
    ],
  },
  {
    mainCategory: 'Muebles/Housing',
    subCategories: [
      'Fornitura',
      'Decoracion',
      'Oficina',
      'Electrodomesticos/Cocina',
      'Electrodomesticos/Entretenimiento',
    ],
  },
  {
    mainCategory: 'Health & Fitness',
    subCategories: [
      'Medical',
      'Farmacia',
      'Gym/Fitness',
      'Seguro Medico',
    ],
  },
  {
    mainCategory: 'Entretenimiento',
    subCategories: [
      'Cine',
      'Conciertos',
      'Actividades',
      'Deportes',
      'Fiestas/reuniones',
    ],
  },
  {
    mainCategory: 'Viajes',
    subCategories: [
      'Vuelos',
      'Hoteles',
      'Food & Dining',
      'Actividades',
      'Transporte',
    ],
  },
  {
    mainCategory: 'Bills & Services',
    subCategories: [
      'Subscripciones',
      'Gastos Bancarios',
      'Gastos Legales',
      'Otros servicios',
    ],
  },
  {
    mainCategory: 'Mascotas',
    subCategories: [
      'Alimento',
      'Medicinas',
      'Veterinario',
      'Juguetes',
    ],
  },
  {
    mainCategory: 'Other',
    subCategories: [
      'Miscellaneous',
      'Uncategorized',
    ],
  },
];

export async function seedCategoriesForGroup(groupId: string, force: boolean = false) {
  // If force is true, delete existing categories first
  if (force) {
    const existingCategories = await prisma.mainCategory.findMany({
      where: { groupId },
    });
    
    if (existingCategories.length > 0) {
      // Delete all existing categories (cascade will delete subcategories)
      await prisma.mainCategory.deleteMany({
        where: { groupId },
      });
    }
  } else {
    // Check if categories already exist for this group
    const existingCategories = await prisma.mainCategory.findFirst({
      where: { groupId },
    });

    if (existingCategories) {
      // Categories already exist, skip seeding
      return;
    }
  }

  // Create main categories and subcategories for the group
  for (const category of categories) {
    await prisma.mainCategory.create({
      data: {
        name: category.mainCategory,
        groupId,
        subCategories: {
          create: category.subCategories.map((subName) => ({
            name: subName,
            groupId,
          })),
        },
      },
    });
  }
}

