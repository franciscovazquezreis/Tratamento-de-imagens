import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from "@google/genai";

export async function generateContent(
  params: GenerateContentParameters,
  userApiKey: string | null
): Promise<GenerateContentResponse> {
  const hasServerKey = process.env.HAS_SERVER_KEY;

  if (hasServerKey) {
    // Mode A: Server-side proxy
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data as GenerateContentResponse;
  } else {
    // Mode B: BYOK (Bring Your Own Key)
    if (!userApiKey) {
      throw new Error("API key is required");
    }

    const ai = new GoogleGenAI({ apiKey: userApiKey });
    return await ai.models.generateContent(params);
  }
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
