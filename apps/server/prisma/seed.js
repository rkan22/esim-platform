const bcrypt = require("bcryptjs");
const prisma = require("../db");

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      passwordHash,
      role: "admin",
      name: "Admin Demo",
    },
  });

  const reseller = await prisma.user.upsert({
    where: { email: "reseller@demo.com" },
    update: {},
    create: {
      email: "reseller@demo.com",
      passwordHash,
      role: "reseller",
      name: "Reseller Demo",
    },
  });

  const orderCount = await prisma.order.count();
  if (orderCount === 0) {
    await prisma.order.createMany({
      data: [
        { plan: "Europe 200GB", status: "Completed", amount: 35, country: "Germany", userId: admin.id },
        { plan: "Global 300GB", status: "Pending", amount: 40, country: "France", userId: reseller.id },
      ],
    });
  }

  const txCount = await prisma.walletTransaction.count();
  if (txCount === 0) {
    await prisma.walletTransaction.createMany({
      data: [
        { type: "Top-up", amount: 500, status: "Completed", userId: admin.id },
        { type: "Order", amount: -35, status: "Completed", userId: admin.id },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });