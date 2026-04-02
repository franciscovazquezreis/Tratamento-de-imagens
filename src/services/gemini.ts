import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from "@google/genai";

export async function generateContent(
  params: GenerateContentParameters,
  userApiKey: string | null
): Promise<GenerateContentResponse> {
  if (!userApiKey) {
    throw new Error("API key is required");
  }

  const ai = new GoogleGenAI({ apiKey: userApiKey });
  return await ai.models.generateContent(params);
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Make a lightweight call to validate the key
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'hi',
      config: { maxOutputTokens: 1 }
    });
    return true;
  } catch (error) {
    console.error("API Key validation failed:", error);
    return false;
  }
}
