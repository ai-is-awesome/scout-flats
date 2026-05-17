import "dotenv/config";

export interface IGeminiClient {
  requestJson<T = unknown>(prompt: string): Promise<T>;
}

const GEMINI_JSON_INSTRUCTIONS = `Please return the response in JSON format.
If you need to include a human-readable message, only use a "message" key.
Do not return any text outside the JSON.`;

export class GeminiClient implements IGeminiClient {
  private static instance: GeminiClient;
  private apiKey?: string;
  private baseUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  private constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.GEMINI_API_KEY;

    if (!this.apiKey) {
      throw new Error(
        "Gemini API Key is  required. Pass it to the constructor or set GEMINI_API_KEY in your env"
      );
    }
  }
  async requestJson<T>(prompt: string): Promise<T> {
    const response = await this.generateResponse(
      `${GEMINI_JSON_INSTRUCTIONS}\n\n${prompt}`
    );
    return parseJsonResponse<T>(response);
  }

  async generateResponse(prompt: string) {
    const url = `${this.baseUrl}?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to generate response. Response Status: ${response.status}. Error: ${response.statusText}`
      );
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    return text;
  }

  static getInstance(apiKey?: string): GeminiClient {
    if (!GeminiClient.instance) {
      GeminiClient.instance = apiKey
        ? new GeminiClient(apiKey)
        : new GeminiClient();
    }
    return GeminiClient.instance;
  }

  getApiKey() {
    return this.apiKey;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }
}

function parseJsonResponse<T>(response: string): T {
  const jsonText = extractJsonText(response);
  try {
    return JSON.parse(jsonText) as T;
  } catch (e) {
    throw new Error(
      `Failed to parse Gemini JSON response: ${
        e instanceof Error ? e.message : String(e)
      }`
    );
  }
}

function extractJsonText(response: string): string {
  const trimmed = response.trim();
  const fencedJson = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedJson?.[1]) return fencedJson[1].trim();

  const objectStart = trimmed.indexOf("{");
  const objectEnd = trimmed.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd > objectStart) {
    return trimmed.slice(objectStart, objectEnd + 1);
  }

  const arrayStart = trimmed.indexOf("[");
  const arrayEnd = trimmed.lastIndexOf("]");
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    return trimmed.slice(arrayStart, arrayEnd + 1);
  }

  return trimmed;
}
