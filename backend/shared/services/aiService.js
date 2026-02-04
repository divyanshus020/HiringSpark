import Bytez from 'bytez.js';
import { OpenRouter } from '@openrouter/sdk';
import { env } from '../config/env.js';

// Initialize Clients
const bytezSdk = env.BYTEZ_API_KEY ? new Bytez(env.BYTEZ_API_KEY) : null;
const openRouter = env.OPENROUTER_API_KEY ? new OpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
  httpReferer: 'https://hspark.com',
  xTitle: 'HiringSpark CRM',
}) : null;

// Settings
const PROVIDER = process.env.AI_PROVIDER || 'bytez'; // 'bytez' or 'openrouter'
const BYTEZ_MODEL = "Qwen/Qwen2.5-7B-Instruct"; // 7B is more stable for extraction
const OR_MODEL = 'google/gemini-2.0-flash-001';

const PLATFORM_KNOWLEDGE = `
PLATFORM GUIDE:
- Admin Dashboard: /admin/dashboard
- HR Accounts: /admin/hr-accounts
- Partners: /admin/partners
- Candidates: /admin/candidates
- Job Postings: /admin/job-postings (Approve/Reject/Share)
`;

const SYSTEM_INSTRUCTION = `You are a Senior Technical Recruiter. Extract candidate data into the specified JSON format.
ONLY include professional work experience. NO personal/academic projects.
Strictly return ONLY the JSON object. NO markdown, NO preamble.`;

const JSON_SCHEMA = `{
  "basic_info": { "full_name": "string", "job_title": "string", "location": "string", "email": "string", "phone": "string", "linkedin": "string", "github": "string", "experience_years": "number" },
  "executive_summary": { "ai_generated_summary": "string" },
  "education": [{ "degree": "string", "institution": "string", "year": "number" }],
  "work_experience": [{ "role": "string", "company": "string", "start_date": "string", "end_date": "string", "responsibilities": ["string"] }],
  "skills": { "technical_skills": { "advanced": ["string"], "intermediate": ["string"] }, "soft_skills": ["string"] },
  "ai_assessment": { "technical_fit": "number", "cultural_fit": "number", "overall_score": "number", "strengths": ["string"], "areas_for_growth": ["string"] }
}`;

export async function extractResumeInfo(text, allLinks, jobContext) {
  try {
    let jdContext = jobContext ? `\nJD: ${jobContext.title}. Requirements: ${jobContext.skillsRequired.join(', ')}.` : "No JD.";
    const cleanedText = text.replace(/[\0-\x1F\x7F-\x9F]/g, "").substring(0, 8000);
    const prompt = `${SYSTEM_INSTRUCTION}\n\nSchema:\n${JSON_SCHEMA}\n\nContext:\n${jdContext}\nLinks: ${allLinks.join(', ')}\n\nResume Text:\n${cleanedText}\n\nJSON Output:`;

    let content = '';

    if (PROVIDER === 'bytez' && bytezSdk) {
      console.log(`🧠 [ByteZ] Starting Extraction with ${BYTEZ_MODEL}...`);
      const { error, output } = await bytezSdk.model(BYTEZ_MODEL).run([{ role: "user", content: prompt }]);
      if (error) throw new Error(`Bytez Error: ${JSON.stringify(error)}`);
      content = typeof output === 'string' ? output : (output?.[0]?.generated_text || output?.generated_text || JSON.stringify(output));
    } else if (openRouter) {
      console.log(`🧠 [OpenRouter] Starting Extraction with ${OR_MODEL}...`);
      const completion = await openRouter.chat.send({
        model: OR_MODEL, messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' }
      });
      content = completion.choices[0]?.message?.content || "";
    }

    if (!content || content.trim() === "") throw new Error("AI returned empty content");
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : content);
  } catch (error) {
    console.error(`❌ AI Extraction failed (${PROVIDER}):`, error.message);
    throw error;
  }
}

export async function generateExecutiveSummary(text) {
  try {
    const prompt = `Generate a 2-sentence summary for this resume:\n\n${text.substring(0, 3000)}`;
    if (PROVIDER === 'bytez' && bytezSdk) {
      const { output } = await bytezSdk.model(BYTEZ_MODEL).run([{ role: "user", content: prompt }]);
      return (typeof output === 'string' ? output : output?.[0]?.generated_text) || "Summary unavailable";
    } else if (openRouter) {
      const completion = await openRouter.chat.send({ model: OR_MODEL, messages: [{ role: 'user', content: prompt }] });
      return completion.choices[0]?.message?.content || "Summary unavailable";
    }
    return "Summary unavailable";
  } catch (e) { return "Summary unavailable"; }
}

export async function chatWithDoc(message, context, role) {
  try {
    const systemPrompt = `You are a helpful AI assistant for HiringSpark. Role: ${role}. Platform Info: ${PLATFORM_KNOWLEDGE}`;
    if (PROVIDER === 'bytez' && bytezSdk) {
      const { output } = await bytezSdk.model(BYTEZ_MODEL).run([{ role: 'system', content: systemPrompt }, { role: 'user', content: message }]);
      return (typeof output === 'string' ? output : output?.[0]?.generated_text) || "Response unavailable";
    } else if (openRouter) {
      const completion = await openRouter.chat.send({ model: OR_MODEL, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }] });
      return completion.choices[0]?.message?.content || "Response unavailable";
    }
  } catch (e) { return "I'm having trouble connecting to AI."; }
}

export async function generateJobDescription(jobTitle, companyName, location, jobType) {
  try {
    const prompt = `Generate a JSON JD for ${jobTitle} at ${companyName}. Format: { "description": "...", "requirements": [], "skills": [] }`;
    let content = "";
    if (PROVIDER === 'bytez' && bytezSdk) {
      const { output } = await bytezSdk.model(BYTEZ_MODEL).run([{ role: "user", content: prompt }]);
      content = typeof output === 'string' ? output : (output?.[0]?.generated_text || "");
    } else if (openRouter) {
      const completion = await openRouter.chat.send({ model: OR_MODEL, messages: [{ role: 'user', content: prompt }] });
      content = completion.choices[0]?.message?.content || "";
    }
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : content);
  } catch (e) { return { description: "Error generating JD", requirements: [], skills: [] }; }
}
