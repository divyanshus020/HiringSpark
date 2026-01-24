import { Redis } from 'ioredis';
import { env } from './env.js';

export const redisConnection = {
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT),
    // Add other options if needed, like password
};

export const redisClient = new Redis(redisConnection);

redisClient.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err);
});

redisClient.on('connect', () => {
    console.log('✅ Redis Connected');
});
