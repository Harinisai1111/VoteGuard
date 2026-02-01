
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Voter } from "../types";

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

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
  if (!import.meta.env.VITE_GEMINI_API_KEY || voters.length < 2) return "Insufficient data for overlap analysis.";

  return withRetry(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "No recommendation generated.";
  }).catch(err => {
    console.error("Gemini Analysis Failed:", err);
    // FALLBACK: Return standardized message if API fails
    const newestVoter = voters.reduce((prev, current) => (prev.lastVerifiedYear > current.lastVerifiedYear) ? prev : current);
    return `**AI Unavailable - Standardized Resolution Protocol:**\n\nBased on metadata analysis, Record ${newestVoter.id} (${newestVoter.name}) appears to be the most current entry (Verified: ${newestVoter.lastVerifiedYear}).\n\n**Recommendation:** Retain Record ${newestVoter.id} and decommission older duplicates to maintain registry integrity.`;
  });
};

export const getRiskExplanation = async (voter: Voter): Promise<string> => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) return "AI explanation unavailable (API Key missing).";

  return withRetry(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "No explanation generated.";
  }).catch(err => {
    console.error("Gemini Risk Explanation Failed:", err);
    // FALLBACK: Return standardized message if API fails
    const reasons = voter.flaggedReasons.length > 0 ? voter.flaggedReasons.join(", ") : "Manual Verification Required";
    return `**AI Service Warning:** Live analysis unavailable.\n\n**Standard Protocol Assessment:** This record has been flagged due to: ${reasons}. Recommend immediate field verification to confirm voter status and clear anomalies.`;
  });
};

export const extractDeceasedInfo = async (base64Data: string, mimeType: string): Promise<{ name: string, aadhaarNumber?: string, dateOfDeath?: string } | null> => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) return null;

  return withRetry(async () => {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            aadhaarNumber: { type: SchemaType.STRING },
            dateOfDeath: { type: SchemaType.STRING }
          },
          required: ["name"]
        }
      }
    });

    const result = await model.generateContent([
      { inlineData: { data: base64Data, mimeType } },
      "Extract details from this death certificate. Return JSON."
    ]);

    const response = await result.response;
    const text = response.text();
    return JSON.parse(text || "null");
  }).catch(err => {
    console.error("Extraction Failed after retries:", err);
    return null;
  });
};
