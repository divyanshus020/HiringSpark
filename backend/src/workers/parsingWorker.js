import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { Candidate } from '../models/Candidate.js';
import { Job } from '../models/Job.js';
import { extractPdfTextAndLinks } from '../services/pdfService.js';
import { extractResumeInfo } from '../services/aiService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const pdfWorker = new Worker('pdf-processing', async (job) => {
    const { candidateId } = job.data;

    try {
        const candidate = await Candidate.findById(candidateId).populate('jobId');
        if (!candidate) return;

        candidate.parsingStatus = 'PROCESSING';
        await candidate.save();

        // 1. Extract Text
        // resumeUrl is like /uploads/resumes/filename.pdf
        const absolutePath = path.join(process.cwd(), candidate.resumeUrl);
        const { text, links } = await extractPdfTextAndLinks(absolutePath);

        if (!text) {
            throw new Error('Could not extract text from PDF');
        }

        // 2. AI Parse
        const jobContext = {
            title: candidate.jobId.jobTitle,
            skillsRequired: candidate.jobId.skills || [],
            description: candidate.jobId.description || ''
        };

        const parsedData = await extractResumeInfo(text, links, jobContext);

        // 3. Update Candidate
        if (parsedData.basic_info.email) candidate.email = parsedData.basic_info.email;
        if (parsedData.basic_info.full_name) candidate.name = parsedData.basic_info.full_name;
        if (parsedData.basic_info.phone) candidate.phoneNumber = parsedData.basic_info.phone;

        candidate.basicInfo = {
            fullName: parsedData.basic_info.full_name,
            jobTitle: parsedData.basic_info.job_title,
            location: parsedData.basic_info.location,
            email: parsedData.basic_info.email,
            phone: parsedData.basic_info.phone,
            linkedin: parsedData.basic_info.linkedin,
            github: parsedData.basic_info.github,
            experienceYears: parsedData.basic_info.experience_years
        };
        candidate.executiveSummary = parsedData.executive_summary.ai_generated_summary;
        candidate.education = parsedData.education.map(e => ({
            degree: e.degree,
            institution: e.institution,
            year: e.year
        }));
        candidate.workExperience = parsedData.work_experience.map(w => ({
            role: w.role,
            company: w.company,
            startDate: w.start_date,
            endDate: w.end_date,
            responsibilities: w.responsibilities
        }));
        candidate.skills = {
            technicalSkills: {
                advanced: parsedData.skills.technical_skills.advanced,
                intermediate: parsedData.skills.technical_skills.intermediate,
                beginner: parsedData.skills.technical_skills.beginner
            },
            softSkills: parsedData.skills.soft_skills
        };
        candidate.aiAssessment = {
            technicalFit: parsedData.ai_assessment.technical_fit,
            culturalFit: parsedData.ai_assessment.cultural_fit,
            overallScore: parsedData.ai_assessment.overall_score,
            strengths: parsedData.ai_assessment.strengths,
            areasForGrowth: parsedData.ai_assessment.areas_for_growth
        };
        candidate.atsScore = parsedData.ai_assessment.overall_score;
        candidate.certifications = parsedData.certifications;

        candidate.isParsed = true;
        candidate.parsingStatus = 'COMPLETED';
        await candidate.save();

        console.log(`✅ Candidate ${candidate.name} parsed successfully`);

    } catch (error) {
        console.error(`❌ Error parsing candidate ${candidateId}:`, error);
        await Candidate.findByIdAndUpdate(candidateId, { parsingStatus: 'FAILED' });
        throw error;
    }
}, { connection: redisConnection });

pdfWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed!`);
});

pdfWorker.on('failed', (job, err) => {
    console.log(`Job ${job.id} failed with ${err.message}`);
});
