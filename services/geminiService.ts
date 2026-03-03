
import { GoogleGenAI, Type } from "@google/genai";
import { Session } from "../types";

// Always use process.env.API_KEY directly as a named parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSessionRecommendations = async (userInterest: string, availableSessions: Session[]) => {
  const prompt = `
    You are the gyaan.one AI Concierge. Based on the user's interest: "${userInterest}", 
    recommend the most relevant sessions from the following list:
    ${availableSessions.map(s => `- [ID: ${s.id}] ${s.title} (${s.category}): ${s.description}`).join('\n')}

    Provide a brief explanation for why each recommended session fits their interest.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sessionId: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["sessionId", "reason"]
              }
            },
            generalAdvice: { type: Type.STRING }
          },
          required: ["recommendations", "generalAdvice"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const chatWithConcierge = async (history: {role: string, text: string}[], message: string) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are the gyaan.one Concierge, an elegant and helpful AI assistant for the gyaan.one learning platform. Your goal is to help students find mentors, understand topics, and encourage peer learning. Use a sophisticated yet welcoming tone."
    }
  });

  // Simple history-to-contents conversion would be needed for a real production app, 
  // but for this MVP we'll just send the current message with context.
  const response = await chat.sendMessage({ message });
  return response.text;
};
