import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { Candidate } from '../../hiringBazaar/models/Candidate.js';
import { Job } from '../../hiringBazaar/models/Job.js';
import { extractTextFromFile } from '../services/extractionService.js';
import { extractResumeInfo } from '../services/aiService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const pdfWorker = new Worker('pdf-processing', async (job) => {
    const { candidateId } = job.data;
    console.log(`🚀 [Worker] Starting processing for Candidate ID: ${candidateId}`);

    try {
        const currentCandidate = await Candidate.findById(candidateId).populate('jobId');
        if (!currentCandidate) return;

        currentCandidate.parsingStatus = 'PROCESSING';
        currentCandidate.parsingProgress = 10;
        currentCandidate.parsingStatusMessage = 'Extracting text from file...';
        await currentCandidate.save();

        let normalizedPath = currentCandidate.resumeUrl;
        if (normalizedPath.startsWith('/')) {
            normalizedPath = normalizedPath.substring(1);
        }
        const absolutePath = path.join(process.cwd(), normalizedPath);
        const { text, links } = await extractTextFromFile(absolutePath);

        if (!text || text.trim().length < 150) {
            console.warn(`⚠️ Low/No text extracted for candidate ${candidateId}. Likely a scanned/image PDF.`);
            currentCandidate.parsingStatus = 'MANUAL_REVIEW';
            currentCandidate.parsingStatusMessage = 'Picture-based Resume: Text could not be extracted (likely an image). Please review manually.';
            currentCandidate.parsingProgress = 0;
            await currentCandidate.save();
            return; // Stop processing further
        }

        currentCandidate.parsingProgress = 40;
        currentCandidate.parsingStatusMessage = 'AI analysis in progress...';
        await currentCandidate.save();

        const jobContext = {
            title: currentCandidate.jobId.jobTitle,
            skillsRequired: currentCandidate.jobId.skills || [],
            description: currentCandidate.jobId.description || ''
        };

        const parsedData = await extractResumeInfo(text, links, jobContext);

        currentCandidate.parsingProgress = 80;
        currentCandidate.parsingStatusMessage = 'Finalizing extraction...';
        await currentCandidate.save();

        const extractedEmail = parsedData.basic_info.email?.toLowerCase();

        // Duplicate handling
        let targetCandidate = currentCandidate;
        if (extractedEmail) {
            const existingCandidate = await Candidate.findOne({
                jobId: currentCandidate.jobId._id,
                email: extractedEmail,
                _id: { $ne: candidateId }
            });

            if (existingCandidate) {
                console.log(`🔗 Duplicate found for ${extractedEmail}. Merging into original.`);

                // Update file reference on the old record
                existingCandidate.resumeUrl = currentCandidate.resumeUrl;

                // Switch target to original record
                targetCandidate = existingCandidate;

                // Remove the extra placeholder record
                await Candidate.findByIdAndDelete(candidateId);
            }
        }

        // Update the candidate (New or Original) with fresh AI data
        targetCandidate.email = extractedEmail || targetCandidate.email;
        targetCandidate.name = parsedData.basic_info.full_name || targetCandidate.name;
        targetCandidate.phoneNumber = parsedData.basic_info.phone || targetCandidate.phoneNumber;

        targetCandidate.basicInfo = {
            fullName: parsedData.basic_info.full_name,
            jobTitle: parsedData.basic_info.job_title,
            location: parsedData.basic_info.location,
            email: parsedData.basic_info.email,
            phone: parsedData.basic_info.phone,
            linkedin: parsedData.basic_info.linkedin,
            github: parsedData.basic_info.github,
            experienceYears: parsedData.basic_info.experience_years
        };

        targetCandidate.executiveSummary = parsedData.executive_summary.ai_generated_summary;
        targetCandidate.education = parsedData.education;
        targetCandidate.workExperience = parsedData.work_experience;
        targetCandidate.skills = {
            technicalSkills: parsedData.skills.technical_skills,
            softSkills: parsedData.skills.soft_skills
        };

        targetCandidate.aiAssessment = {
            technicalFit: parsedData.ai_assessment.technical_fit,
            culturalFit: parsedData.ai_assessment.cultural_fit,
            overallScore: parsedData.ai_assessment.overall_score,
            strengths: parsedData.ai_assessment.strengths,
            areasForGrowth: parsedData.ai_assessment.areas_for_growth
        };

        targetCandidate.atsScore = parsedData.ai_assessment.overall_score;
        targetCandidate.isParsed = true;
        targetCandidate.parsingStatus = 'COMPLETED';
        targetCandidate.parsingProgress = 100;
        targetCandidate.parsingStatusMessage = 'Parsing completed successfully.';

        await targetCandidate.save();
        console.log(`✅ Record processed for ${targetCandidate.name}`);

    } catch (error) {
        console.error(`❌ Error processing candidate ${candidateId}:`, error.message);

        let errorMessage = error.message;
        if (errorMessage.includes('ENOENT')) errorMessage = 'File not found on server.';
        if (errorMessage.includes('truncated')) errorMessage = 'AI extraction failed due to document complexity. Please review manually.';

        // Fallback to MANUAL_REVIEW on error (e.g., AI failed or file corrupted)
        await Candidate.findByIdAndUpdate(candidateId, {
            parsingStatus: 'MANUAL_REVIEW',
            parsingStatusMessage: `Parsing stopped: ${errorMessage}`,
            parsingProgress: 0
        });
        throw error;
    }
}, {
    connection: redisConnection,
    concurrency: 10, // Process 10 resumes at a time
    lockDuration: 60000
});

pdfWorker.on('completed', (job) => console.log(`Job ${job.id} completed!`));
pdfWorker.on('failed', (job, err) => console.log(`Job ${job.id} failed: ${err.message}`));