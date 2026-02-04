import { OpenRouter } from '@openrouter/sdk';
import { env } from '../config/env.js';
import { transporter } from '../config/mail.js';

// Configuration for Keys
const API_KEYS = [
  env.OPENROUTER_KEY_1,
  env.OPENROUTER_KEY_2,
  env.OPENROUTER_KEY_3
].filter(Boolean);

let currentKeyIndex = 0;
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

const getClient = () => {
  const key = API_KEYS[currentKeyIndex] || env.OPENROUTER_API_KEY;
  return new OpenRouter({
    apiKey: key,
    httpReferer: 'https://hspark.com',
    xTitle: 'HiringSpark CRM',
  });
};

async function notifyAdminOfKeySwitch(failedKey, nextKeyIndex) {
  if (!transporter || !env.ADMIN_EMAIL) return;
  try {
    await transporter.sendMail({
      from: `"HiringSpark Alert" <${env.EMAIL_USER}>`,
      to: env.ADMIN_EMAIL,
      subject: '⚠️ AI API Key Failover',
      html: `<p>Key <b>...${failedKey.slice(-5)}</b> failed. Shifted to Key #${nextKeyIndex + 1}.</p>`
    });
  } catch (e) { console.error('Notify error:', e.message); }
}

async function callOpenRouter(payload) {
  const maxAttempts = Math.max(API_KEYS.length, 1);
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const completion = await getClient().chat.send(payload);
      return completion.choices[0]?.message?.content || "";
    } catch (error) {
      if ((error.message?.includes('401') || error.message?.includes('402') || error.message?.includes('429')) && API_KEYS.length > 1) {
        const failedKey = API_KEYS[currentKeyIndex];
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
        notifyAdminOfKeySwitch(failedKey, currentKeyIndex);
        continue;
      }
      throw error;
    }
  }
}

const SYSTEM_INSTRUCTION = `You are an expert ATS (Applicant Tracking System). Analyze the resume text against the Job Description (JD).
1. EXTRACT: Name, Email, Phone, Experience Years (ONLY professional), Skills, Education.
2. ATS SCORE (0-100): 
   - 40% Skills Match: Keywords from JD.
   - 30% Experience Match: Relevant years and roles.
   - 20% Education & Format.
   - 10% Industry fit.
BE STRICT. If 0% match, give 0. If perfect match, give 100.
Strictly return ONLY JSON.`;

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
    let jdContext = jobContext ? `JD: ${jobContext.title}. Skills: ${jobContext.skillsRequired.join(', ')}. Desc: ${jobContext.description}` : "No JD.";
    const prompt = `${SYSTEM_INSTRUCTION}\n\nSchema:\n${JSON_SCHEMA}\n\nContext:\n${jdContext}\n\nResume Text:\n${text.substring(0, 15000)}\n\nOutput JSON:`;

    const content = await callOpenRouter({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return {
      basic_info: parsed.basic_info || { full_name: "Unknown", email: "pending@parsing.com" },
      executive_summary: parsed.executive_summary || { ai_generated_summary: "" },
      education: parsed.education || [],
      work_experience: parsed.work_experience || [],
      skills: parsed.skills || { technical_skills: { advanced: [], intermediate: [] }, soft_skills: [] },
      ai_assessment: parsed.ai_assessment || { technical_fit: 50, cultural_fit: 50, overall_score: 50, strengths: [], areas_for_growth: [] },
      ...parsed
    };
  } catch (error) {
    console.error('❌ AI Error:', error.message);
    throw error;
  }
}

export async function generateExecutiveSummary(text) { return "Summary unavailable"; }
export async function chatWithDoc(msg, context, role) { return "Chat offline."; }
export async function generateJobDescription(title, co, loc, type) { return { description: "", requirements: [], skills: [] }; }
