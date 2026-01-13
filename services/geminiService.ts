import { GoogleGenAI } from "@google/genai";

export const generateBedtimeStory = async (kidName: string, theme: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Error: No API Key found. The parental overlords forgot to pay the silicon rent.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Write a very short, soothing bedtime story (max 100 words) for a child named ${kidName}. The theme is ${theme}. Keep it sweet and sleepy.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Fast response needed
      }
    });

    return response.text || "The AI is sleeping too. Shhh.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Once upon a time, the internet broke. The End.";
  }
};