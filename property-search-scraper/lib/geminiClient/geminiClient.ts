import "dotenv/config";

interface IGeminiClient {
  requestJson<T = any>(prompt: string): Promise<T>;
}

const GEMINI_JSON_INSTRUCTIONS = `Please return the resopnse in JSON  format. 
Please only use message field in response in case you need to write a message json's "message" key.
I do not need any information from you other than
the json`;

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
  requestJson<T>(prompt: string): Promise<T> {
    return new Promise((res, rej) => {
      return res({} as T);
    });
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
