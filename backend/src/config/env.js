import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  MONGO_URI: z.string().min(1, "MongoDB URI is required"),
  JWT_SECRET: z.string().min(1, "JWT Secret is required"),

  // Admin Credentials from .env
  ADMIN_EMAIL: z.email("Invalid Admin Email"),
  ADMIN_PASSWORD: z.string().min(6, "Admin Password must be at least 6 characters"),

  // Email Configuration
  EMAIL_USER: z.string().email("Invalid EMAIL_USER").optional(),
  EMAIL_PASS: z.string().min(1, "EMAIL_PASS is required").optional(),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid Environment Variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;