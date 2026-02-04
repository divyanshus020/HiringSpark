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

// Helper to get active client
const getClient = () => {
  if (API_KEYS.length === 0) {
    // Fallback to legacy key if others not set
    return new OpenRouter({
      apiKey: env.OPENROUTER_API_KEY || '',
      httpReferer: 'https://hspark.com',
      xTitle: 'HiringSpark CRM',
    });
  }
  return new OpenRouter({
    apiKey: API_KEYS[currentKeyIndex],
    httpReferer: 'https://hspark.com',
    xTitle: 'HiringSpark CRM',
  });
};

// Function to notify admin via email
async function notifyAdminOfKeySwitch(failedKey, nextKeyIndex) {
  if (!transporter || !env.ADMIN_EMAIL) return;

  try {
    const mailOptions = {
      from: `"HiringSpark System" <${env.EMAIL_USER}>`,
      to: env.ADMIN_EMAIL,
      subject: '⚠️ AI API Key Failover Alert',
      html: `
                <h3>API Key Failure Detected</h3>
                <p>Hello Admin,</p>
                <p>The OpenRouter API key ending in <b>...${failedKey.slice(-6)}</b> has failed (likely out of credits or rate limited).</p>
                <p><b>Action Taken:</b> The system has automatically shifted to API Key #${nextKeyIndex + 1}.</p>
                <p>Please check your OpenRouter account dashboard to top up credits.</p>
                <p>Regards,<br/>HiringSpark AI Engine</p>
            `
    };
    await transporter.sendMail(mailOptions);
    console.log('📧 Admin notified of API key switch.');
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error.message);
  }
}

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

/**
 * Execute AI call with automatic failover logic
 */
async function callOpenRouterWithFailover(method, payload) {
  let attempts = 0;
  const maxAttempts = API_KEYS.length || 1;

  while (attempts < maxAttempts) {
    const client = getClient();
    try {
      if (method === 'chat') {
        const completion = await client.chat.send(payload);
        return completion.choices[0]?.message?.content || "";
      }
    } catch (error) {
      const isAuthError = error.message?.includes('401') || error.message?.includes('402') || error.message?.includes('429');

      if (isAuthError && API_KEYS.length > 1 && attempts < API_KEYS.length - 1) {
        const failedKey = API_KEYS[currentKeyIndex];
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
        console.warn(`🔄 API Key #${attempts + 1} failed. Shifting to Key #${currentKeyIndex + 1}...`);

        // Fire and forget notification
        notifyAdminOfKeySwitch(failedKey, currentKeyIndex);

        attempts++;
        continue; // Retry with next key
      }
      throw error; // Re-throw if not an auth error or no more keys
    }
  }
  throw new Error('All configured AI API keys have failed.');
}

export async function extractResumeInfo(text, allLinks, jobContext) {
  try {
    let jdContext = jobContext ? `\nJD: ${jobContext.title}. Requirements: ${jobContext.skillsRequired.join(', ')}.` : "No JD.";
    const cleanedText = text.replace(/[\0-\x1F\x7F-\x9F]/g, "").substring(0, 15000);
    const prompt = `${SYSTEM_INSTRUCTION}\n\nSchema:\n${JSON_SCHEMA}\n\nContext:\n${jdContext}\nLinks: ${allLinks.join(', ')}\n\nResume Text:\n${cleanedText}\n\nJSON Output:`;

    console.log(`🧠 [OpenRouter] Starting Extraction with key #${currentKeyIndex + 1}...`);

    const content = await callOpenRouterWithFailover('chat', {
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    if (!content || content.trim() === "") throw new Error("AI returned empty content");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return {
      basic_info: parsed.basic_info || { full_name: "Candidate", email: "pending@parsing.com" },
      executive_summary: parsed.executive_summary || { ai_generated_summary: "No summary generated." },
      education: parsed.education || [],
      work_experience: parsed.work_experience || [],
      skills: parsed.skills || { technical_skills: { advanced: [], intermediate: [] }, soft_skills: [] },
      ai_assessment: parsed.ai_assessment || { technical_fit: 0, cultural_fit: 0, overall_score: 0, strengths: [], areas_for_growth: [] },
      ...parsed
    };
  } catch (error) {
    console.error(`❌ AI Extraction failed:`, error.message);
    throw error;
  }
}

export async function generateExecutiveSummary(text) {
  try {
    const prompt = `Generate a 2-sentence summary for this resume:\n\n${text.substring(0, 3000)}`;
    const content = await callOpenRouterWithFailover('chat', {
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }]
    });
    return content || "Summary unavailable";
  } catch (e) { return "Summary unavailable"; }
}

export async function chatWithDoc(message, context, role) {
  try {
    const systemPrompt = `You are a helpful AI assistant for HiringSpark. Role: ${role}.`;
    const content = await callOpenRouterWithFailover('chat', {
      model: DEFAULT_MODEL,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }]
    });
    return content || "Response unavailable";
  } catch (e) { return "I'm having trouble connecting to AI."; }
}

export async function generateJobDescription(jobTitle, companyName, location, jobType) {
  try {
    const prompt = `Generate a JSON JD for ${jobTitle} at ${companyName}. Format: { "description": "...", "requirements": [], "skills": [] }`;
    const content = await callOpenRouterWithFailover('chat', {
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }]
    });
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : content);
  } catch (e) { return { description: "Error generating JD", requirements: [], skills: [] }; }
}
