import process from "node:process";
// Server/automation only. Do not import this module from browser code.
// Verified model: https://developers.openai.com/api/docs/models/gpt-4.1-mini
export const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini-2025-04-14";
const RESPONSES_URL = "https://api.openai.com/v1/responses";

export async function createOpenAIResponse({
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
  instructions,
  input,
  maxOutputTokens = 2000,
  jsonSchema,
  fetchImpl = globalThis.fetch,
  timeoutMs = 60000,
}) {
  if (typeof apiKey !== "string" || !apiKey.trim()) {
    throw new Error("OPENAI_API_KEY is required for OpenAI generation.");
  }
  if (typeof model !== "string" || !/^gpt-[a-z0-9.-]+$/.test(model)) {
    throw new Error("OPENAI_MODEL must name an OpenAI GPT model compatible with the Responses API.");
  }
  if (!Number.isInteger(maxOutputTokens) || maxOutputTokens < 1 || maxOutputTokens > 16000) {
    throw new Error("maxOutputTokens must be an integer between 1 and 16000.");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(RESPONSES_URL, {
      method: "POST",
      redirect: "error",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        instructions,
        input,
        max_output_tokens: maxOutputTokens,
        store: false,
        ...(jsonSchema ? { text: { format: { type: "json_schema", strict: true, ...jsonSchema } } } : {}),
      }),
    });
    // Never surface upstream bodies: they can contain request data or credentials.
    if (!response.ok) throw new Error(`OpenAI API request failed (HTTP ${response.status}).`);
    const data = await response.json();
    if (data.status !== "completed" || data.error) {
      throw new Error("OpenAI response was not completed; no output was accepted.");
    }
    const content = (data.output || [])
      .filter((item) => item.type === "message" && item.role === "assistant")
      .flatMap((item) => item.content || []);
    if (content.some((block) => block.type === "refusal")) {
      throw new Error("OpenAI declined this request; no output was accepted.");
    }
    const text = content.filter((block) => block.type === "output_text")
      .map((block) => block.text).join("\n").trim();
    if (!text) throw new Error("OpenAI returned no text; no output was accepted.");
    return { text, usage: data.usage || {}, model: data.model || model };
  } catch (error) {
    if (controller.signal.aborted) throw new Error("OpenAI request timed out; no output was accepted.");
    // Retain only our own safe error messages, not a raw network/proxy message.
    if (error.message?.startsWith("OpenAI ")) throw error;
    throw new Error("OpenAI request failed; no output was accepted.");
  } finally {
    clearTimeout(timer);
  }
}

export function jsonArraySchema(name, key, properties) {
  return {
    name,
    schema: {
      type: "object",
      additionalProperties: false,
      required: [key],
      properties: {
        [key]: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties,
            required: Object.keys(properties),
          },
        },
      },
    },
  };
}
