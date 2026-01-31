
import { GoogleGenAI, Type } from "@google/genai";
import { Voter } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Utility for exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isQuotaError = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');

      if (isQuotaError && i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 1000 + (Math.random() * 1000);
        console.warn(`Gemini API Quota Exceeded. Retrying in ${Math.round(waitTime)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const analyzeIdentityOverlap = async (voters: Voter[]): Promise<string> => {
  if (!process.env.API_KEY || voters.length < 2) return "Insufficient data for overlap analysis.";

  return withRetry(async () => {
    const prompt = `
      You are an Identity Resolution Expert for the Election Commission. 
      Analyze these ${voters.length} voter records sharing the same Aadhaar Identity Hash: ${voters[0].aadhaarMeta?.aadhaarIdHash}.
      
      Note: Aadhaar is the primary identity anchor. Secondary IDs (Passport, etc.) are optional and used for extra verification but not mandatory if Aadhaar is linked.
      
      Records:
      ${voters.map(v => `- EPIC: ${v.id}, Name: ${v.name}, State: ${v.state}, Last Verified: ${v.lastVerifiedYear}`).join('\n')}
      
      Tasks:
      1. Determine which record is likely the most current/valid.
      2. Provide a recommendation on which record to retain and which to decommission.
      
      Response should be concise and professional.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt,
    });

    return response.text || "No recommendation generated.";
  }).catch(err => {
    if (err?.message?.includes('429')) return "System Busy: API Quota exceeded. Please try again in 60 seconds.";
    return "Error performing identity resolution.";
  });
};

export const getRiskExplanation = async (voter: Voter): Promise<string> => {
  if (!process.env.API_KEY) return "AI explanation unavailable (API Key missing).";

  return withRetry(async () => {
    const prompt = `
      You are an expert Election Verification Analyst. Analyze this voter record.
      
      Voter Details:
      Name: ${voter.name}
      ID: ${voter.id}
      Aadhaar Status: ${voter.aadhaarMeta ? 'LINKED' : 'NOT LINKED'}
      Secondary ID: ${voter.otherIdMeta ? voter.otherIdMeta.type : 'NONE'}
      Flagged Reasons: ${voter.flaggedReasons.join(', ')}
      
      Policy: Aadhaar is sufficient for identification. Secondary ID is only needed if Aadhaar is missing.
      
      Provide a concise 3-sentence explanation of why this record is flagged, or if the flag seems like a false positive.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt,
    });

    return response.text || "No explanation generated.";
  }).catch(err => {
    if (err?.message?.includes('429')) return "API Rate Limit reached. The system is currently throttled. Please check your Gemini API billing/quota.";
    return "An error occurred while generating the risk analysis.";
  });
};

export const extractDeceasedInfo = async (base64Data: string, mimeType: string): Promise<{ name: string, idNumber?: string, dateOfDeath?: string } | null> => {
  if (!process.env.API_KEY) return null;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Extract details from this death certificate. Return JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            idNumber: { type: Type.STRING },
            dateOfDeath: { type: Type.STRING }
          },
          required: ["name"]
        }
      }
    });

    return JSON.parse(response.text?.trim() || "null");
  }).catch(err => {
    console.error("Extraction Failed after retries:", err);
    return null;
  });
};
