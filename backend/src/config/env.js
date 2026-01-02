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
  
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid Environment Variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;