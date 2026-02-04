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

const SYSTEM_INSTRUCTION = `You are a Senior Technical Recruiter. Extract candidate data into the specified JSON format.
If a Job Description (JD) is provided, calculate scores based on the fit.

CRITICAL INSTRUCTION:
1. ONLY include professional work experience (jobs, internships) in "work_experience" and "experience_years".
2. ABSOLUTELY DO NOT include personal projects, academic projects, or freelance projects in the "work_experience" list.
3. Projects should be ignored for the "experience_years" calculation.
4. Calculate "experience_years" by summing the duration of professional jobs and internships only.
5. Identify LinkedIn, GitHub, and other professional links from the provided "EXTRACTED LINKS FROM CV". 
   - Put LinkedIn in "linkedin" field.
   - Put GitHub in "github" field.
   - Put ALL other relevant links (Portfolio, Twitter, Behance, etc.) in the "links" array inside "basic_info".

Assessment:
- Technical Fit: 0-100 based on skills/JD matching and also match the required experience years.
- Cultural Fit: 0-100 based on soft skills/leadership.
- Overall Score: 70% Technical + 30% General potential.
Provide a 2-3 sentence executive summary.
Strictly return ONLY the JSON object.`;

const JSON_SCHEMA = `{
  "basic_info": { 
    "full_name": "string", 
    "job_title": "string", 
    "location": "string", 
    "email": "string", 
    "phone": "string", 
    "linkedin": "string", 
    "github": "string", 
    "links": ["string"],
    "experience_years": "number" 
  },
  "executive_summary": { "ai_generated_summary": "string" },
  "education": [{ "degree": "string", "institution": "string", "year": "number" }],
  "work_experience": [{ "role": "string", "company": "string", "start_date": "string", "end_date": "string", "responsibilities": ["string"] }],
  "skills": { "technical_skills": { "advanced": ["string"], "intermediate": ["string"] }, "soft_skills": ["string"] },
  "ai_assessment": { "technical_fit": "number", "cultural_fit": "number", "overall_score": "number", "strengths": ["string"], "areas_for_growth": ["string"] }
}`;

export async function extractResumeInfo(text, allLinks, jobContext) {
  try {
    let jdContext = jobContext ? `JD: ${jobContext.title}. Skills: ${jobContext.skillsRequired.join(', ')}. Desc: ${jobContext.description}` : "No JD.";
    const linksContext = allLinks?.length > 0 ? `\n\nEXTRACTED LINKS FROM CV: ${allLinks.join(', ')}` : "";

    const prompt = `${SYSTEM_INSTRUCTION}\n\nSchema:\n${JSON_SCHEMA}\n\nContext:\n${jdContext}${linksContext}\n\nResume Text:\n${text.substring(0, 15000)}\n\nOutput JSON:`;

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

export async function generateExecutiveSummary(text) {
  try {
    const prompt = `Generate a professional 2-3 sentence executive summary for this resume. Focus on key strengths, experience level, and standout skills.\n\nResume:\n${text.substring(0, 5000)}\n\nExecutive Summary:`;

    const content = await callOpenRouter({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
    });

    return content.trim();
  } catch (error) {
    console.error('❌ Executive Summary Error:', error.message);
    return "Unable to generate summary at this time.";
  }
}

export async function chatWithDoc(msg, context, role = 'user') {
  try {
    const systemPrompt = role === 'hr'
      ? 'You are an HR assistant helping to evaluate candidates. Be professional and insightful.'
      : 'You are a helpful AI assistant analyzing documents. Provide clear, concise answers.';

    const contextText = typeof context === 'string'
      ? context
      : JSON.stringify(context).substring(0, 10000);

    const prompt = `${systemPrompt}\n\nContext:\n${contextText}\n\nQuestion: ${msg}\n\nAnswer:`;

    const content = await callOpenRouter({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
    });

    return content.trim();
  } catch (error) {
    console.error('❌ Chat Error:', error.message);
    return "I'm unable to process your request at the moment. Please try again.";
  }
}

export async function generateJobDescription(title, company, location, type) {
  try {
    const prompt = `Generate a comprehensive job description in JSON format for the following position:

Job Title: ${title}
Company: ${company || 'Our Company'}
Location: ${location || 'Remote'}
Employment Type: ${type || 'Full-time'}

Return ONLY valid JSON with this structure:
{
  "description": "2-3 paragraph job description",
  "responsibilities": ["responsibility 1", "responsibility 2", ...],
  "requirements": ["requirement 1", "requirement 2", ...],
  "skills": ["skill 1", "skill 2", ...],
  "qualifications": ["qualification 1", "qualification 2", ...],
  "benefits": ["benefit 1", "benefit 2", ...]
}

Make it professional, engaging, and industry-standard.`;

    const content = await callOpenRouter({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return {
      description: parsed.description || "",
      responsibilities: parsed.responsibilities || [],
      requirements: parsed.requirements || [],
      skills: parsed.skills || [],
      qualifications: parsed.qualifications || [],
      benefits: parsed.benefits || []
    };
  } catch (error) {
    console.error('❌ Job Description Error:', error.message);
    return {
      description: `We are seeking a talented ${title} to join our team.`,
      responsibilities: ["To be defined"],
      requirements: ["To be defined"],
      skills: [],
      qualifications: [],
      benefits: []
    };
  }
}
