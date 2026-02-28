import { z } from 'zod';

const inferredNodeEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),

  MONGODB_URI: z.string().url(),
  USE_IN_MEMORY_MONGO: z.coerce.boolean().default(false),

  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  REDIS_URL: z.string().min(1), // ioredis-compatible for BullMQ

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  ENCRYPTION_KEY: z.string().length(64), // 32 bytes hex-encoded

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_PRIVATE_FOLDER: z.string().default('kujuana/private'),

  PESAPAL_CONSUMER_KEY: z.string().default(''),
  PESAPAL_CONSUMER_SECRET: z.string().default(''),
  PESAPAL_ENV: z.enum(['sandbox', 'live']).default('sandbox'),
  PESAPAL_IPN_URL: z.string().url().default('http://localhost:4000/api/v1/payments/webhook/pesapal'),

  FLUTTERWAVE_PUBLIC_KEY: z.string().default(''),
  FLUTTERWAVE_SECRET_KEY: z.string().default(''),
  FLUTTERWAVE_WEBHOOK_SECRET: z.string().default(''),

  PAYSTACK_PUBLIC_KEY: z.string().default(''),
  PAYSTACK_SECRET_KEY: z.string().default(''),
  PAYSTACK_CALLBACK_URL: z.string().url().default('http://localhost:3000/subscription?status=return'),

  MPESA_ENV: z.enum(['sandbox', 'live']).default('sandbox'),
  MPESA_CONSUMER_KEY: z.string().default(''),
  MPESA_CONSUMER_SECRET: z.string().default(''),
  MPESA_SHORTCODE: z.string().default(''),
  MPESA_PASSKEY: z.string().default(''),
  MPESA_CALLBACK_URL: z.string().url().default('http://localhost:4000/api/v1/payments/webhook/mpesa'),
  MPESA_TRANSACTION_TYPE: z.enum(['CustomerPayBillOnline', 'CustomerBuyGoodsOnline']).default(
    'CustomerPayBillOnline',
  ),

  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().email().default('noreply@kujuana.com'),

  ADMIN_INVITE_SECRET: z.string().default(
    inferredNodeEnv === 'production' ? '' : 'bootstrap-secret-for-first-admin',
  ),
  DEV_ADMIN_EMAIL: z.string().email().default('admin@kujuana.com'),
  DEV_ADMIN_PASSWORD: z.string().default('Admin@kujuana2024!'),
  DEV_MANAGER_EMAIL: z.string().email().optional(),
  DEV_MANAGER_PASSWORD: z.string().optional(),

  API_BASE_URL: z.string().url().default('http://localhost:4000'),
  WEB_BASE_URL: z.string().url().default('http://localhost:3000'),
  PAYMENT_SIMULATION_ENABLED: z.coerce.boolean().default(false),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
