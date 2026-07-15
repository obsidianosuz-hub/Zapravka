import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.dispenser.deleteMany({});
  await prisma.fuelType.deleteMany({});
  await prisma.corporateClient.deleteMany({});
  await prisma.gasStorage.deleteMany({});
  await prisma.compressorTelemetry.deleteMany({});
  await prisma.powerConsumption.deleteMany({});

  await prisma.user.createMany({
    data: [
      {
        username: 'admin',
        password: 'admin2013',
        pinCode: '0123',
        role: 'ADMIN',
        name: 'Admin User',
        email: 'admin@ecogas.uz',
        phone: '+998 90 123 45 67'
      },
      {
        username: 'kassa',
        password: 'password123',
        pinCode: '2222',
        role: 'CASHIER',
        name: 'Kassa Operator',
        email: 'kassa@ecogas.uz',
        phone: '+998 90 987 65 43'
      }
    ]
  });

  const corpClient = await prisma.corporateClient.create({
    data: {
      name: 'Yandex Taxi Park',
      balance: 10000000, 
    },
  });

  const methane = await prisma.fuelType.create({
    data: {
      name: 'Methane (m3)',
      category: 'METHANE',
      price: 3800,
    },
  });

  const propane = await prisma.fuelType.create({
    data: {
      name: 'Propane (L)',
      category: 'PROPANE',
      price: 5500,
    },
  });

  const electric = await prisma.fuelType.create({
    data: {
      name: 'Electricity (kW)',
      category: 'ELECTRIC',
      price: 1200,
    },
  });

  const dispensers = [
    { dispenserNumber: 1, fuelTypeId: methane.id, status: 'IDLE' },
    { dispenserNumber: 2, fuelTypeId: methane.id, status: 'BUSY' },
    { dispenserNumber: 3, fuelTypeId: propane.id, status: 'IDLE' },
    { dispenserNumber: 4, fuelTypeId: propane.id, status: 'OFFLINE' },
  ];

  for (const data of dispensers) {
    await prisma.dispenser.create({
      data: {
        dispenserNumber: data.dispenserNumber,
        fuelTypeId: data.fuelTypeId,
        status: data.status,
      },
    });
  }
  
  await prisma.gasStorage.create({
    data: {
      fuelCategory: 'METHANE',
      currentLevel: 200, 
      maxCapacity: 250,
      unit: 'bar',
    }
  });

  await prisma.gasStorage.create({
    data: {
      fuelCategory: 'PROPANE',
      currentLevel: 4500, 
      maxCapacity: 5000,
      unit: 'L',
    }
  });

  await prisma.compressorTelemetry.create({
    data: {
      pressureBar: 210,
      temperature: 65.5,
    }
  });

  await prisma.powerConsumption.create({
    data: {
      kwhConsumed: 1250.5,
    }
  });

  const createdDispensers = await prisma.dispenser.findMany();
  const d1 = createdDispensers.find(d => d.dispenserNumber === 1);
  const d3 = createdDispensers.find(d => d.dispenserNumber === 3);

  await prisma.order.createMany({
    data: [
      {
        dispenserId: d1 ? d1.id : 1,
        fuelTypeId: methane.id,
        volume: 20,
        totalAmount: 20 * 3800,
        paymentType: 'BANK_CARD',
        status: 'COMPLETED',
      },
      {
        dispenserId: d3 ? d3.id : 3,
        fuelTypeId: propane.id,
        volume: 35,
        totalAmount: 35 * 5500,
        paymentType: 'CORPORATE_ACCOUNT',
        status: 'COMPLETED',
        corporateClientId: corpClient.id,
      }
    ]
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
