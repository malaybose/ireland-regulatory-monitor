import { GoogleGenAI, Type } from "@google/genai";
import { RegulatoryUpdate, ImpactAnalysis } from "../types";

export const fetchRegulatoryUpdates = async (): Promise<{ updates: RegulatoryUpdate[], groundingMetadata: any }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing. Please set API_KEY environment variable in Vercel.");

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: "Search for the 10 most recent regulatory updates, press releases, or news items from the Central Bank of Ireland (CBI), EIOPA, and the Pensions Authority Ireland. Focus on the Insurance and Pensions sectors. Provide real, factual data from their websites. Do not limit to just today; fetch the most recent available information.",
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

    let data;
    try {
      const cleanText = response.text.replace(/```json|```/g, "").trim();
      data = JSON.parse(cleanText || '{"updates": []}');
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", response.text);
      data = { updates: [] };
    }
    
    const updatesWithUrls = (data.updates || []).map((update: RegulatoryUpdate, index: number) => {
      // Use the URL provided in the JSON, or fallback to grounding chunks
      const chunk = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[index];
      return {
        ...update,
        url: update.url || chunk?.web?.uri || "https://www.centralbank.ie"
      };
    });

    return {
      updates: updatesWithUrls,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
  } catch (error) {
    console.error("Error fetching updates:", error);
    return { updates: [], groundingMetadata: null };
  }
};

export const generateAggregatedAnalysis = async (updates: RegulatoryUpdate[]): Promise<ImpactAnalysis | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || !updates || updates.length === 0) return null;

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-pro-preview';

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Acting as a Senior Regulatory Consultant for Irish Financial Services, provide a high-level summary and risk analysis of these specific updates: ${JSON.stringify(updates)}. Format the response as a clear JSON object.`,
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
    const cleanText = response.text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanText || '{}');
  } catch (error) {
    console.error("Error generating analysis:", error);
    return null;
  }
};