import { GoogleGenAI, Type } from "@google/genai";
import { TailoredResume } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const tailorResume = async (
  jobDescription: string, 
  personalInfo: TailoredResume['personalInfo'],
  experience: TailoredResume['experience'],
  education: TailoredResume['education'],
  skills: TailoredResume['skills'],
  projects: TailoredResume['projects']
): Promise<TailoredResume> => {
  const prompt = `
    Role: You are a Senior Career Coach and Expert Resume Writer.
    Objective: Refine and tailor a resume to a specific Job Description (JD) using the provided structured data.
    
    Job Description:
    ${jobDescription}
    
    User Data to Refine:
    - Personal Info: ${JSON.stringify(personalInfo)}
    - Experience: ${JSON.stringify(experience)}
    - Education: ${JSON.stringify(education)}
    - Skills: ${JSON.stringify(skills)}
    - Projects: ${JSON.stringify(projects)}
    
    Instructions:
    1. Rewrite all experience bullet points using the Google X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]".
    2. Ensure the professional summary is rewritten to perfectly align with the JD.
    3. Use sophisticated, executive-level English.
    4. Prioritize high-impact action verbs.
    5. Ensure the resume is ATS-optimized by including key skills and keywords from the JD.
    6. Structure the output as a JSON object matching the TailoredResume interface.
    7. IMPORTANT: Retain the core facts (dates, companies, schools) but optimize the descriptions and bullet points for the target JD.
    
    The output MUST be a valid JSON object.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          personalInfo: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              location: { type: Type.STRING },
              linkedin: { type: Type.STRING },
              website: { type: Type.STRING }
            },
            required: ["fullName", "email", "phone", "location"]
          },
          summary: { type: Type.STRING },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING },
                position: { type: Type.STRING },
                duration: { type: Type.STRING },
                location: { type: Type.STRING },
                bulletPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["company", "position", "duration", "location", "bulletPoints"]
            }
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                school: { type: Type.STRING },
                degree: { type: Type.STRING },
                duration: { type: Type.STRING },
                location: { type: Type.STRING }
              },
              required: ["school", "degree", "duration", "location"]
            }
          },
          skills: {
            type: Type.OBJECT,
            properties: {
              technical: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              soft: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["technical", "soft"]
          },
          projects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                technologies: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                link: { type: Type.STRING }
              },
              required: ["name", "description", "technologies"]
            }
          }
        },
        required: ["personalInfo", "summary", "experience", "education", "skills"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate resume content.");
  }

  return JSON.parse(response.text);
};
