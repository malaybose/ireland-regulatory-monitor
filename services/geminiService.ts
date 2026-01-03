import { GoogleGenAI, Type } from "@google/genai";
import { RegulatoryUpdate, ImpactAnalysis } from "../types";

const MOCK_UPDATES: RegulatoryUpdate[] = [
  {
    id: "m1",
    source: 'CBI',
    title: "Intermediary Inducements and Conflict of Interest Update",
    summary: "The Central Bank has issued a new circular regarding the monitoring of inducements paid to insurance intermediaries, emphasizing consumer protection.",
    date: "Latest Release",
    impactScore: 8,
    category: "Conduct of Business",
    url: "https://www.centralbank.ie",
    analysis: "High priority for compliance teams. Requires review of existing broker commission structures."
  },
  {
    id: "m2",
    source: 'EIOPA',
    title: "Opinion on the Supervision of Captive Insurers",
    summary: "New guidance on the proportionality principle for captive insurance undertakings under Solvency II.",
    date: "Recent Update",
    impactScore: 6,
    category: "Solvency II",
    url: "https://www.eiopa.europa.eu",
    analysis: "Relevant for firms with captive structures. Focus on governance and reporting requirements."
  }
];

export const fetchRegulatoryUpdates = async (): Promise<{ updates: RegulatoryUpdate[], groundingMetadata: any, log?: string }> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    console.warn("API_KEY is not defined. Using simulated data.");
    return { updates: MOCK_UPDATES, groundingMetadata: null, log: "Using simulated data (API_KEY missing)" };
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: "Search for 5-8 recent regulatory updates from the Central Bank of Ireland and EIOPA specifically for Insurance and Pensions. Return real results found on their websites.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            updates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  source: { type: Type.STRING },
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  date: { type: Type.STRING },
                  impactScore: { type: Type.NUMBER },
                  category: { type: Type.STRING },
                  url: { type: Type.STRING },
                  analysis: { type: Type.STRING },
                },
                required: ["id", "source", "title", "summary", "date", "impactScore", "category", "url", "analysis"]
              }
            }
          }
        }
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("AI returned an empty response.");
    }
    
    const cleanText = responseText.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanText || '{"updates": []}');
    
    return {
      updates: data.updates && data.updates.length > 0 ? data.updates : MOCK_UPDATES,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata,
      log: "Live data retrieved successfully."
    };
  } catch (error: any) {
    console.error("Gemini Search Error:", error);
    return { 
      updates: MOCK_UPDATES, 
      groundingMetadata: null, 
      log: `Error: ${error.message || 'Unknown search error'}. Falling back to cached data.`
    };
  }
};

export const generateAggregatedAnalysis = async (updates: RegulatoryUpdate[]): Promise<ImpactAnalysis | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") return {
    overallSentiment: 'Neutral',
    keyRisks: ["Lack of live API connection", "Intermediary compliance monitoring"],
    recommendedActions: ["Check Vercel Environment Variables", "Review CBI Inducement Circular"],
    summary: "System is operating in simulation mode. Current regulatory environment shows steady pressure on conduct of business standards."
  };

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Provide an executive risk summary for these updates: ${JSON.stringify(updates)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSentiment: { type: Type.STRING },
            keyRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
          },
          required: ["overallSentiment", "keyRisks", "recommendedActions", "summary"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      return null;
    }

    const cleanText = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanText || '{}');
  } catch (e) {
    console.error("Analysis generation error:", e);
    return null;
  }
};