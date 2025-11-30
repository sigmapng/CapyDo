import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.create({
    data: {
      username: "capybara",
      password: hashedPassword,
      firstname: "Capy",
      tasks: {
        create: [
          {
            name: "Learn Prisma",
            status: "in_progress",
            importance: "high",
            dueTo: new Date("2025-12-31"),
          },
          {
            name: "Build API",
            status: "pending",
            importance: "medium",
            dueTo: new Date("2025-12-15"),
          },
        ],
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: "testuser",
      password: hashedPassword,
      firstname: "Test",
      tasks: {
        create: [
          {
            name: "Write tests",
            status: "pending",
            importance: "high",
          },
        ],
      },
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log({ user1, user2 });
}

main()
  .catch((e) => {
    console.error("Error seeding database:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
