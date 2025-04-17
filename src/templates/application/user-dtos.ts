import { z } from 'zod';

export const UserSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  name: z.string().optional(),
  role: z.string().default("user")
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password is required" })
});

export type CreateUserDTO = z.infer<typeof UserSchema>;
export type UpdateUserDTO = Partial<CreateUserDTO>;
export type LoginDTO = z.infer<typeof LoginSchema>;


export function isUserDTO(data: unknown): data is CreateUserDTO {
  try {
    UserSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

export function isLoginDTO(data: unknown): data is LoginDTO {
  try {
    LoginSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}