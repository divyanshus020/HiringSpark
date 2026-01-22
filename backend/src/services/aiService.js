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
