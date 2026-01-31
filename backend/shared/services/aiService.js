import { OpenRouter } from '@openrouter/sdk';
import { env } from '../config/env.js';

// Initialize OpenRouter
const openRouter = new OpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
  httpReferer: 'https://hspark.com',
  xTitle: 'HiringSpark CRM',
});

// Using Gemini 2.0 Flash via OpenRouter for high speed and reliability
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

const SYSTEM_INSTRUCTION = `You are a Senior Technical Recruiter. Extract candidate data into the specified JSON format.
If a Job Description (JD) is provided, calculate scores based on the fit.

CRITICAL INSTRUCTION:
1. ONLY include professional work experience (jobs, internships) in "work_experience" and "experience_years".
2. ABSOLUTELY DO NOT include personal projects, academic projects, or freelance projects in the "work_experience" list.
3. Projects should be ignored for the "experience_years" calculation.
4. Calculate "experience_years" by summing the duration of professional jobs and internships only.

Assessment:
- Technical Fit: 0-100 based on skills/JD matching.
- Cultural Fit: 0-100 based on soft skills/leadership.
- Overall Score: 70% Technical + 30% General potential.
Provide a 2-3 sentence executive summary.
Strictly return ONLY the JSON object.`;

const JSON_SCHEMA = `
{
  "basic_info": {
    "full_name": "string",
    "job_title": "string",
    "location": "string",
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "github": "string",
    "experience_years": "number"
  },
  "executive_summary": {
    "ai_generated_summary": "string"
  },
  "education": [
    { "degree": "string", "institution": "string", "location": "string", "year": "number" }
  ],
  "work_experience": [
    {
      "role": "string",
      "company": "string",
      "start_date": "string",
      "end_date": "string",
      "responsibilities": ["string"]
    }
  ],
  "skills": {
    "technical_skills": {
      "advanced": ["string"],
      "intermediate": ["string"],
      "beginner": ["string"]
    },
    "soft_skills": ["string"]
  },
  "ai_assessment": {
    "technical_fit": "number",
    "cultural_fit": "number",
    "overall_score": "number",
    "strengths": ["string"],
    "areas_for_growth": ["string"]
  },
  "certifications": ["string"]
}`;

export async function extractResumeInfo(
  text,
  allLinks,
  jobContext
) {
  try {
    let jdContext = jobContext ? `\nJD: ${jobContext.title}. Requirements: ${jobContext.skillsRequired.join(', ')}. Desc: ${jobContext.description}` : "No specific JD.";
    console.log(jdContext);

    const prompt = `${SYSTEM_INSTRUCTION}\n\nSchema:\n${JSON_SCHEMA}\n\nContext:\n${jdContext}\nLinks: ${allLinks.join(', ')}\n\nResume Text:\n${text.substring(0, 12000)}`;

    const completion = await openRouter.chat.send({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: false,
    });

    const choice = completion.choices[0];
    if (!choice || !choice.message || !choice.message.content) {
      throw new Error('AI returned an empty response');
    }

    const content = choice.message.content;
    const jsonString = (typeof content === 'string' ? content : '').trim();
    // Sometimes AI wraps JSON in backticks
    const cleanedJson = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');

    console.log('AI Response:', cleanedJson);

    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error('AI optimization extraction error:', error);
    throw new Error(`AI extraction failed: ${error.message}`);
  }
}

export async function generateExecutiveSummary(text) {
  try {
    const prompt = `Generate a 2-sentence professional summary for this resume:\n\n${text.substring(0, 3000)}`;

    const completion = await openRouter.chat.send({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: false,
    });

    const choice = completion.choices[0];
    const content = choice?.message?.content;
    return (typeof content === 'string' ? content : '') || "Summary unavailable";
  } catch (error) {
    console.error('OpenRouter summary error:', error);
    return "Summary unavailable";
  }
}

const PLATFORM_KNOWLEDGE = `
PLATFORM GUIDE & NAVIGATION:

1. ADMIN SIDEBAR MENU:
   - Dashboard (/admin/dashboard): Overview of platform statistics.
   - HR Accounts (/admin/hr-accounts): Manage HR users.
   - PartnerHB (Dropdown Menu):
     * Partner List (/admin/partners): View, Approve, or Reject partner applications.
     * Job Assignments (/admin/job-assignments): View table of jobs shared with partners.
   - Candidates (/admin/candidates): Global candidate pool.
     * Features: Filter by Company (Sidebar), Status update, View CV.
   - Job Postings (/admin/job-postings): Manage jobs.
     * Actions: Approve/Reject pending jobs, Share jobs with Partners.

2. KEY WORKFLOWS (HOW-TO):
   
   [How to Share a Job with Partners?]
   1. Navigate to "Job Postings".
   2. Find the active job you want to share.
   3. Click the "Share" icon (Purple Users icon) in the Actions column.
   4. In the dialog, select one or more partners from the list.
   5. Click "Share".
   
   [How to See Assigned Jobs?]
   1. Go to the Sidebar -> "PartnerHB" -> "Job Assignments".
   2. You will see a table with Job Title, Company, Assigned Partner, and Date.

   [How to Filter Candidates by Company?]
   1. Go to "Candidates".
   2. On the left sidebar, you will see a list of Companies.
   3. Click on any company name to filter the candidate list.

   [How to Approve a Partner?]
   1. Go to "PartnerHB" -> "Partner List".
   2. Find partners with status "Pending".
   3. Click "Approve".
`;

export async function chatWithDoc(message, context, role) {
  try {
    const systemPrompt = `You are a helpful AI assistant for the HiringSpark platform.
    
    Current User Role: ${role}
    
    About HiringSpark:
    HiringSpark is a recruitment platform connecting Companies (Admins), HRs, and Candidates.
    
    ${PLATFORM_KNOWLEDGE}
    
    Rules:
    1. If the user is 'admin', you can discuss anything about the platform, navigation, and workflows.
    2. If the user is 'hr', you can ONLY discuss public job postings and general platform usage. DO NOT reveal admin routes or sensitive data.
    3. Use the PLATFORM GUIDE above to answer "How do I..." questions accurately.
    4. Be concise, professional, and helpful.
    
    User Context/Query: "${message}"`;

    const completion = await openRouter.chat.send({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      stream: false,
    });

    const choice = completion.choices[0];
    return choice?.message?.content || "I couldn't generate a response.";

  } catch (error) {
    console.error('AI Chat error:', error);
    throw new Error("Failed to chat with AI");
  }
}

/**
 * Generate a job description, requirements, and skills based on job title
 */
export async function generateJobDescription(jobTitle, companyName, location, jobType) {
  try {
    const prompt = `You are a Senior Technical Recruiter. Based on the job title "${jobTitle}", generate a professional job description, a list of requirements, and a list of key skills.
    
    Context:
    - Company: ${companyName || 'A growing company'}
    - Location: ${location || 'Remote/Hybrid'}
    - Job Type: ${jobType || 'Full-time'}
    
    Strictly return ONLY a JSON object in the following format:
    {
      "description": "A detailed 2-3 paragraph job description...",
      "requirements": ["Requirement 1", "Requirement 2", "Requirement 3", "Requirement 4", "Requirement 5"],
      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]
    }`;

    const completion = await openRouter.chat.send({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: false,
    });

    const choice = completion.choices[0];
    if (!choice || !choice.message || !choice.message.content) {
      throw new Error('AI returned an empty response');
    }

    const content = choice.message.content;
    const jsonString = (typeof content === 'string' ? content : '').trim();
    const cleanedJson = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');

    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error('AI job description generation error:', error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}
