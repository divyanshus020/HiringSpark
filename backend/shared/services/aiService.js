import Bytez from 'bytez.js';
import { env } from '../config/env.js';

/* 
// ==========================================
// BACKUP: OpenRouter Configuration (Commented)
// ==========================================
import { OpenRouter } from '@openrouter/sdk';
const openRouter = new OpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
  httpReferer: 'https://hspark.com',
  xTitle: 'HiringSpark CRM',
});
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

export async function extractResumeInfo_OR(text, allLinks, jobContext) {
  try {
    let jdContext = jobContext ? `\nJD: ${jobContext.title}. Requirements: ${jobContext.skillsRequired.join(', ')}. Desc: ${jobContext.description}` : "No specific JD.";
    const cleanedText = text.replace(/[\0-\x1F\x7F-\x9F]/g, "").substring(0, 12000);
    const prompt = `...`; // (Original prompt logic)
    const completion = await openRouter.chat.send({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (e) { console.error(e); throw e; }
}
*/

// ==========================================
// CURRENT: Bytez Configuration
// ==========================================
const sdk = new Bytez(env.BYTEZ_API_KEY);

// Using a more capable model for extraction
const EXTRACTION_MODEL = "Qwen/Qwen2.5-72B-Instruct";

const SYSTEM_INSTRUCTION = `You are a Senior Technical Recruiter. Extract candidate data into the specified JSON format.
If a Job Description (JD) is provided, calculate scores based on the fit.
ONLY include professional work experience. NO personal/academic projects in work_experience.
Strictly return ONLY the JSON object. NO markdown, NO text before/after.`;

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

export async function extractResumeInfo(text, allLinks, jobContext) {
  try {
    const model = sdk.model(EXTRACTION_MODEL);
    let jdContext = jobContext ? `\nJD: ${jobContext.title}. Requirements: ${jobContext.skillsRequired.join(', ')}. Desc: ${jobContext.description}` : "No specific JD.";
    const cleanedText = text.replace(/[\0-\x1F\x7F-\x9F]/g, "").substring(0, 15000);

    const prompt = `${SYSTEM_INSTRUCTION}\n\nSchema:\n${JSON_SCHEMA}\n\nContext:\n${jdContext}\nLinks: ${allLinks.join(', ')}\n\nResume Text:\n${cleanedText}\n\nJSON Output:`;

    console.log(`🧠 [Bytez] Starting AI Extraction with ${EXTRACTION_MODEL}...`);

    const { error, output } = await model.run([
      { role: "user", content: prompt }
    ]);

    if (error) {
      console.error('❌ Bytez Error:', error);
      throw new Error(`Bytez AI error: ${JSON.stringify(error)}`);
    }

    const content = typeof output === 'string' ? output : (output?.[0]?.generated_text || '');

    // Extract JSON block
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;

    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ Bytez JSON Parse Error. Raw output:', content);
      throw new Error(`AI response truncated or malformed: ${parseError.message}`);
    }
  } catch (error) {
    console.error('AI extraction error:', error);
    throw new Error(`AI extraction failed: ${error.message}`);
  }
}

export async function generateExecutiveSummary(text) {
  try {
    const model = sdk.model("Qwen/Qwen2.5-7B-Instruct");
    const prompt = `Generate a 2-sentence professional summary for this resume text:\n\n${text.substring(0, 3000)}`;

    const { error, output } = await model.run([
      { role: "user", content: prompt }
    ]);

    if (error) throw new Error(JSON.stringify(error));
    return (typeof output === 'string' ? output : output?.[0]?.generated_text) || "Summary unavailable";
  } catch (error) {
    console.error('Bytez summary error:', error);
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
    const model = sdk.model("Qwen/Qwen2.5-7B-Instruct");
    const systemPrompt = `You are a helpful AI assistant for the HiringSpark platform.
    
    Current User Role: ${role}
    
    About HiringSpark:
    HiringSpark is a recruitment platform connecting Companies (Admins), HRs, and Candidates.
    
    ${PLATFORM_KNOWLEDGE}
    
    Rules:
    1. If the user is 'admin', you can discuss anything about the platform, navigation, and workflows.
    2. If the user is 'hr', you can ONLY discuss public job postings and general platform usage. DO NOT reveal admin routes or sensitive data.
    3. Use the PLATFORM GUIDE above to answer "How do I..." questions accurately.
    4. Be concise, professional, and helpful.`;

    const { error, output } = await model.run([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ]);

    if (error) throw new Error(JSON.stringify(error));
    return (typeof output === 'string' ? output : output?.[0]?.generated_text) || "I couldn't generate a response.";
  } catch (error) {
    console.error('AI Chat error:', error);
    throw new Error("Failed to chat with AI");
  }
}

export async function generateJobDescription(jobTitle, companyName, location, jobType) {
  try {
    const model = sdk.model("Qwen/Qwen2.5-72B-Instruct");
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

    const { error, output } = await model.run([
      { role: 'user', content: prompt }
    ]);

    if (error) throw new Error(JSON.stringify(error));

    const content = typeof output === 'string' ? output : (output?.[0]?.generated_text || '');
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;

    return JSON.parse(jsonString);
  } catch (error) {
    console.error('AI job description generation error:', error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}
