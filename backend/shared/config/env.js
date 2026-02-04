import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  MONGO_URI: z.string().default('mongodb://localhost:27017/HiringBazaar'),
  JWT_SECRET: z.string().default('HiringBazaar-jwt-secret-change-in-production'),

  // Admin Credentials (optional - only needed for seeding)
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),

  // Email Configuration (optional)
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASS: z.string().optional(),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // AI & Redis
  OPENROUTER_API_KEY: z.string().optional(),
  BYTEZ_API_KEY: z.string().optional(),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.string().default('6379'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid Environment Variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;