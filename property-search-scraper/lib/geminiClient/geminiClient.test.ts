import "dotenv/config";

import { expect, test } from "vitest";
import { GeminiClient } from "./geminiClient";

test("Should not return an error", () => {
  let error = false;
  try {
    const client = new GeminiClient();
  } catch (e) {
    error = true;
  }

  expect(error).toBe(false);
});

test("Printing gemini response", async () => {
  const client = GeminiClient.getInstance();
  const response = await client.generateResponse("Hello how's it going?");
  console.log(response);
  expect(response).toBeDefined();
});
