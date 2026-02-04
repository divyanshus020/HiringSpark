import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { Candidate } from '../../hiringBazaar/models/Candidate.js';
import { extractTextFromFile } from '../services/extractionService.js';
import { extractResumeInfo } from '../services/aiService.js';
import path from 'path';

export const pdfWorker = new Worker('pdf-processing', async (job) => {
    const { candidateId } = job.data;
    console.log(`[Worker] ⚡ Job ${job.id} Received for Candidate: ${candidateId}`);

    try {
        const currentCandidate = await Candidate.findById(candidateId).populate('jobId');

        if (!currentCandidate) {
            console.error(`[Worker] ❌ Candidate ${candidateId} not found in DB.`);
            return;
        }

        console.log(`[Worker] 🏃 Processing: ${currentCandidate.name} (${currentCandidate.resumeUrl})`);

        currentCandidate.parsingStatus = 'PROCESSING';
        currentCandidate.parsingProgress = 10;
        currentCandidate.parsingStatusMessage = 'Extracting text...';
        await currentCandidate.save();

        let normalizedPath = currentCandidate.resumeUrl;
        if (normalizedPath.startsWith('/')) normalizedPath = normalizedPath.substring(1);
        const absolutePath = path.join(process.cwd(), normalizedPath);

        console.log(`[Worker] 📄 Extracting from: ${absolutePath}`);
        const { text, links } = await extractTextFromFile(absolutePath);

        if (!text || text.trim().length < 150) {
            console.warn(`[Worker] ⚠️ Low text in ${candidateId}. Marking for manual review.`);
            currentCandidate.parsingStatus = 'MANUAL_REVIEW';
            currentCandidate.parsingStatusMessage = 'Could not extract enough text. Manual review required.';
            currentCandidate.parsingProgress = 0;
            await currentCandidate.save();
            return;
        }

        console.log(`[Worker] 🤖 Sending to AI (OpenRouter)...`);
        currentCandidate.parsingProgress = 40;
        currentCandidate.parsingStatusMessage = 'AI analysis in progress...';
        await currentCandidate.save();

        const jobContext = {
            title: currentCandidate.jobId?.jobTitle || 'General Position',
            skillsRequired: currentCandidate.jobId?.skills || [],
            description: currentCandidate.jobId?.description || ''
        };

        const parsedData = await extractResumeInfo(text, links, jobContext);

        if (!parsedData || !parsedData.basic_info) {
            throw new Error('AI returned malformed or empty data.');
        }

        console.log(`[Worker] ✅ AI Extraction Successful for ${parsedData.basic_info.full_name}`);

        currentCandidate.parsingProgress = 80;
        currentCandidate.parsingStatusMessage = 'Finalizing...';
        await currentCandidate.save();

        const extractedEmail = parsedData.basic_info.email?.toLowerCase();

        // Update fields
        currentCandidate.email = extractedEmail || currentCandidate.email;
        currentCandidate.name = parsedData.basic_info.full_name || currentCandidate.name;
        currentCandidate.phoneNumber = parsedData.basic_info.phone || currentCandidate.phoneNumber;

        currentCandidate.basicInfo = {
            fullName: parsedData.basic_info.full_name,
            jobTitle: parsedData.basic_info.job_title,
            location: parsedData.basic_info.location,
            email: parsedData.basic_info.email,
            phone: parsedData.basic_info.phone,
            linkedin: parsedData.basic_info.linkedin,
            github: parsedData.basic_info.github,
            experienceYears: parsedData.basic_info.experience_years
        };

        currentCandidate.executiveSummary = parsedData.executive_summary?.ai_generated_summary || "";
        currentCandidate.education = parsedData.education || [];
        currentCandidate.workExperience = parsedData.work_experience || [];
        currentCandidate.skills = {
            technicalSkills: parsedData.skills?.technical_skills || { advanced: [], intermediate: [], beginner: [] },
            softSkills: parsedData.skills?.soft_skills || []
        };

        currentCandidate.aiAssessment = {
            technicalFit: parsedData.ai_assessment?.technical_fit || 0,
            culturalFit: parsedData.ai_assessment?.cultural_fit || 0,
            overallScore: parsedData.ai_assessment?.overall_score || 0,
            strengths: parsedData.ai_assessment?.strengths || [],
            areasForGrowth: parsedData.ai_assessment?.areas_for_growth || []
        };

        currentCandidate.atsScore = parsedData.ai_assessment?.overall_score || 0;
        currentCandidate.isParsed = true;
        currentCandidate.parsingStatus = 'COMPLETED';
        currentCandidate.parsingProgress = 100;
        currentCandidate.parsingStatusMessage = 'Success.';

        await currentCandidate.save();
        console.log(`[Worker] ⭐ Done: ${currentCandidate.name}`);

    } catch (error) {
        console.error(`[Worker] 💥 Error on candidate ${candidateId}:`, error.message);

        await Candidate.findByIdAndUpdate(candidateId, {
            parsingStatus: 'FAILED',
            parsingStatusMessage: `Error: ${error.message}`,
            parsingProgress: 0
        });
        throw error;
    }
}, {
    connection: redisConnection,
    concurrency: 20, // High concurrency for bulk
    lockDuration: 60000
});

pdfWorker.on('completed', (job) => console.log(`[Worker] Job ${job.id} done.`));
pdfWorker.on('failed', (job, err) => console.error(`[Worker] Job ${job.id} FAILED: ${err.message}`));
pdfWorker.on('error', (err) => console.error(`[Worker] GLOBAL ERROR:`, err));