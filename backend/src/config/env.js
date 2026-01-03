import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  MONGO_URI: z.string().default('mongodb://localhost:27017/hirespark'),
  JWT_SECRET: z.string().default('hirespark-jwt-secret-change-in-production'),

  // Admin Credentials (optional - only needed for seeding)
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),

  // Email Configuration (optional)
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASS: z.string().optional(),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid Environment Variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;