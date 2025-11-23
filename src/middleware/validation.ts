import { z } from "zod";

// User validation schemas
export const RegisterSchema = z.object({
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

export const LoginSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(1),
});

export const UpdateUserSchema = z.object({
  firstname: z.string().min(1).max(50),
  password: z
    .string()
    .min(8)
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});

// Task validation schemas
export const CreateTaskSchema = z.object({
  name: z.string().min(1).max(100),
  status: z.enum(["pending", "in-progress", "completed"]),
  importance: z.enum(["low", "medium", "high"]),
  dueTo: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
});

export const UpdateTaskSchema = z.object({
  name: z.string().min(1).max(100),
  status: z.enum(["pending", "in-progress", "completed"]),
  importance: z.enum(["low", "medium", "high"]),
  dueTo: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
});

// Parameter validation
export const UsernameParamSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
});

export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
export type CreateTaskData = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskData = z.infer<typeof UpdateTaskSchema>;

export function validateRegister(data: unknown): Promise<RegisterData> {
  return RegisterSchema.parseAsync(data);
}

export function validateLogin(data: unknown): Promise<LoginData> {
  return LoginSchema.parseAsync(data);
}
