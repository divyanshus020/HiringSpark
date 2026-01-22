import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

// 1. PDF Processing Queue: Text extraction & AI Analysis
export const pdfQueue = new Queue('pdf-processing', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        },
        removeOnComplete: true,
        removeOnFail: { age: 24 * 3600 }
    }
});

// 2. Email Notification Queue: Shortlisting alerts
// Note: User prompt mentioned email notification after parsing
export const emailQueue = new Queue('email-notification', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 5000
        }
    }
});
