import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { transporter } from '../config/mail.js';
import { env } from '../config/env.js';

export const emailWorker = new Worker('email-notification', async (job) => {
    const { type, data } = job.data;
    console.log(`[EmailWorker] 📧 Job ${job.id} Received. Type: ${type}`);

    try {
        if (!transporter || !env.EMAIL_USER) {
            throw new Error('Email transporter or user not configured');
        }

        if (type === 'job-approved') {
            const { hrEmail, hrName, jobTitle, jobLocation, jobType, postedDate } = data;
            const { jobApprovedEmailTemplate } = await import('../utils/emailTemplates.js');

            const emailHtml = jobApprovedEmailTemplate(
                hrName,
                jobTitle,
                jobLocation,
                jobType,
                postedDate
            );

            await transporter.sendMail({
                from: `"HireSpark Admin" <${env.EMAIL_USER}>`,
                to: hrEmail,
                subject: `✅ Job Approved - ${jobTitle}`,
                html: emailHtml
            });

            console.log(`[EmailWorker] ✅ Job approval email sent to: ${hrEmail}`);
        } else if (type === 'candidate-shortlisted') {
            const { candidateEmail, candidateName, jobTitle, companyName } = data;
            const { candidateShortlistedEmailTemplate } = await import('../utils/emailTemplates.js');

            const emailHtml = candidateShortlistedEmailTemplate(
                candidateName,
                jobTitle,
                companyName
            );

            await transporter.sendMail({
                from: `"HireSpark Recruitment" <${env.EMAIL_USER}>`,
                to: candidateEmail,
                subject: `🎉 Great News! You've been Shortlisted for ${jobTitle}`,
                html: emailHtml
            });

            console.log(`[EmailWorker] ✅ Shortlist notification sent to: ${candidateEmail}`);
        } else {
            console.warn(`[EmailWorker] ⚠️ Unknown email type: ${type}`);
        }

    } catch (error) {
        console.error(`[EmailWorker] 💥 Error processing job ${job.id}:`, error.message);
        throw error;
    }
}, {
    connection: redisConnection,
    concurrency: 5,
    lockDuration: 30000
});

emailWorker.on('completed', (job) => console.log(`[EmailWorker] Job ${job.id} completed successfully.`));
emailWorker.on('failed', (job, err) => console.error(`[EmailWorker] Job ${job.id} failed: ${err.message}`));
emailWorker.on('error', (err) => console.error(`[EmailWorker] Global Error:`, err));
