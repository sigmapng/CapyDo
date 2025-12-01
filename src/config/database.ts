import { PrismaClient } from "@prisma/client";
import { env } from "./env.ts";

const prisma = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

prisma
  .$connect()
  .then(() => console.log("Database connected"))
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

export default prisma;
