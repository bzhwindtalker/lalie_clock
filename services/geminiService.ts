import { GoogleGenAI } from "@google/genai";

// Ensure API key is available
const apiKey = process.env.API_KEY || ''; 

export const generateBedtimeStory = async (kidName: string, theme: string): Promise<string> => {
  if (!apiKey) {
    return "Error: No API Key found. The parental overlords forgot to pay the silicon rent.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
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