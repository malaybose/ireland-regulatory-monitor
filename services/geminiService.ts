
import { GoogleGenAI, Type } from "@google/genai";
import { RegulatoryUpdate, ImpactAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchRegulatoryUpdates = async (): Promise<{ updates: RegulatoryUpdate[], groundingMetadata: any }> => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model: model,
    contents: "Find recent (last 30 days) regulatory updates for Irish Insurance and Pensions from CBI, EIOPA, and the Pensions Authority.",
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

  const data = JSON.parse(response.text || '{"updates": []}');
  return {
    updates: data.updates,
    groundingMetadata: response.candidates?.[0]?.groundingMetadata
  };
};

export const generateAggregatedAnalysis = async (updates: RegulatoryUpdate[]): Promise<ImpactAnalysis> => {
  const model = 'gemini-3-pro-preview';
  const response = await ai.models.generateContent({
    model: model,
    contents: `Analyze these updates for the Irish market: ${JSON.stringify(updates)}`,
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
  return JSON.parse(response.text || '{}');
};
