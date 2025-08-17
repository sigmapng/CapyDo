import { z } from "zod";

const RegisterSchema = z.object({
  firstname: z.string().min(1).max(50),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z
    .string()
    .min(8)
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});

export function validateRegister(data: unknown) {
  return RegisterSchema.parseAsync(data);
}

const LoginSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(100),
});

export function validateLogin(data: unknown) {
  return LoginSchema.parse(data);
}
