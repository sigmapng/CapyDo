import { z } from "zod";

const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // JWT
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

// Валідуємо env при старті
const parseEnv = () => {
  try {
    const parsed = envSchema.parse(process.env);
    console.log("Environment variables validated");
    return parsed;
  } catch (error) {
    console.error("Invalid environment variables:");
    if (error instanceof z.ZodError) {
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      });
    }
    process.exit(1);
  }
};

export const env = parseEnv();

// Типізований доступ
export type Env = z.infer<typeof envSchema>;
