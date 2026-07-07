import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateContent = async (prompt, generationConfig = {}) => {
  try {
    const result = await genAI.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: generationConfig,
    });
    return result.text;
  } catch (error) {
    throw new Error(`Gemini API error: ${error.message}`);
  }
};

export const generateJson = async (prompt, schema) => {
  try {
    const result = await genAI.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.0,
      },
    });
    return JSON.parse(result.text);
  } catch (error) {
    throw new Error(`Gemini JSON generation error: ${error.message}`);
  }
};
