import { z } from "zod";

// Parameter validation
export const UsernameParamSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_]+$/);

export const FirstnameParamSchema = z.string().min(1).max(50);

export const PasswordParamSchema = z
  .string()
  .min(8)
  .max(100)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/);

// User validation schemas
export const RegisterSchema = z.object({
  firstname: FirstnameParamSchema,
  username: UsernameParamSchema,
  password: PasswordParamSchema,
});

export const LoginSchema = z.object({
  username: UsernameParamSchema,
  password: z.string().min(1),
});

export const UpdateUserSchema = z.object({
  firstname: FirstnameParamSchema,
  password: PasswordParamSchema,
});

// Task validation schemas
export const TaskSchema = z.object({
  name: z.string().min(1).max(100),
  status: z.enum(["not started", "in progress", "completed"]),
  importance: z.enum(["low", "medium", "high"]),
  dueTo: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
});

// Param Functions
export type UsernameParamData = z.infer<typeof UsernameParamSchema>;
export type PasswordParamData = z.infer<typeof PasswordParamSchema>;
export type FirstnameParamData = z.infer<typeof FirstnameParamSchema>;

export function validateUsername(data: unknown): Promise<UsernameParamData> {
  return UsernameParamSchema.parseAsync(data);
}

export function validatePassword(data: unknown): Promise<PasswordParamData> {
  return PasswordParamSchema.parseAsync(data);
}

export function validateFirstname(data: unknown): Promise<FirstnameParamData> {
  return FirstnameParamSchema.parseAsync(data);
}

//Auth Functions
export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;

export function validateRegister(data: unknown): Promise<RegisterData> {
  return RegisterSchema.parseAsync(data);
}

export function validateLogin(data: unknown): Promise<LoginData> {
  return LoginSchema.parseAsync(data);
}

export function validateUpdate(data: unknown): Promise<UpdateUserData> {
  return UpdateUserSchema.parseAsync(data);
}

//Task Functions
export type TaskData = z.infer<typeof TaskSchema>;

export function validateTask(data: unknown): Promise<TaskData> {
  return TaskSchema.parseAsync(data);
}
