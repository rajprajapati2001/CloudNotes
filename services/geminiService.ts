
import { GoogleGenAI } from "@google/genai";

export async function enhanceNoteContent(content: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful writing assistant. Please take the following note content and improve its clarity, grammar, and organization while keeping its original meaning. Format it neatly. Note: ${content}`,
      config: {
        systemInstruction: "You are an expert editor. Enhance notes for clarity and impact.",
        temperature: 0.7,
      },
    });

    return response.text || content;
  } catch (error) {
    console.error("Gemini AI Enhancement failed:", error);
    alert("AI enhancement failed. Please check your internet connection or try again later.");
    return content;
  }
}
