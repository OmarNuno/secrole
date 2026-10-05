import test from "node:test";
import assert from "node:assert/strict";
import { createOpenAIResponse, DEFAULT_OPENAI_MODEL, jsonArraySchema } from "../lib/openai.js";

const complete = (text = "Answer", extra = {}) => ({
  status: "completed",
  model: DEFAULT_OPENAI_MODEL,
  output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text }] }],
  usage: { input_tokens: 4, output_tokens: 2 },
  ...extra,
});
const respond = (data) => async () => ({ ok: true, json: async () => data });
const base = { apiKey: "test-only-not-a-key", input: "Example" };

test("OpenAI request uses only the official endpoint, bearer auth, bounded tokens, and no stored response", async () => {
  let calls = 0;
  const result = await createOpenAIResponse({ ...base, fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url, "https://api.openai.com/v1/responses");
    assert.equal(options.redirect, "error");
    assert.equal(options.headers.Authorization, "Bearer test-only-not-a-key");
    assert.equal(options.headers["x-api-key"], undefined);
    const body = JSON.parse(options.body);
    assert.equal(body.model, DEFAULT_OPENAI_MODEL);
    assert.equal(body.store, false);
    assert.equal(body.max_output_tokens, 2000);
    assert.equal(body.tools, undefined);
    assert.ok(options.signal);
    return { ok: true, json: async () => complete() };
  } });
  assert.equal(calls, 1);
  assert.deepEqual(result, { text: "Answer", usage: { input_tokens: 4, output_tokens: 2 }, model: DEFAULT_OPENAI_MODEL });
});

test("structured output uses a strict object wrapper and required fields", async () => {
  const jsonSchema = jsonArraySchema("examples", "items", { name: { type: "string" } });
  await createOpenAIResponse({ ...base, jsonSchema, fetchImpl: async (_url, options) => {
    const format = JSON.parse(options.body).text.format;
    assert.equal(format.type, "json_schema");
    assert.equal(format.strict, true);
    assert.deepEqual(format.schema.required, ["items"]);
    assert.equal(format.schema.additionalProperties, false);
    assert.deepEqual(format.schema.properties.items.items.required, ["name"]);
    assert.equal(format.schema.properties.items.items.additionalProperties, false);
    return { ok: true, json: async () => complete('{"items":[]}') };
  } });
});

test("missing OpenAI key and non-OpenAI models fail before any network access", async () => {
  const fetchImpl = () => assert.fail("No network call allowed");
  await assert.rejects(createOpenAIResponse({ ...base, apiKey: "", fetchImpl }), /OPENAI_API_KEY/);
  await assert.rejects(createOpenAIResponse({ ...base, model: "claude-haiku", fetchImpl }), /OPENAI_MODEL/);
  await assert.rejects(createOpenAIResponse({ ...base, maxOutputTokens: 17000, fetchImpl }), /maxOutputTokens/);
});

test("HTTP errors never expose upstream bodies and never retry or fall back", async () => {
  for (const status of [401, 429, 500]) {
    let calls = 0;
    await assert.rejects(createOpenAIResponse({ ...base, fetchImpl: async (url) => {
      calls++;
      assert.equal(url, "https://api.openai.com/v1/responses");
      return { ok: false, status, text: () => assert.fail("Do not read error body"), json: () => assert.fail("Do not read error body") };
    } }), new RegExp(`HTTP ${status}`));
    assert.equal(calls, 1);
  }
});

test("incomplete, failed, refused, empty and malformed responses are rejected", async () => {
  for (const data of [
    complete("Partial", { status: "incomplete" }),
    complete("Partial", { status: "failed" }),
    complete("Partial", { error: { message: "private upstream detail" } }),
    complete("", { output: [{ type: "message", role: "assistant", content: [{ type: "refusal", refusal: "No" }] }] }),
    complete("   "),
    { output_text: "SDK-only helper field is not the REST response" },
  ]) {
    await assert.rejects(createOpenAIResponse({ ...base, fetchImpl: respond(data) }), /OpenAI/);
  }
});

test("network and JSON failures do not leak arbitrary error text", async () => {
  for (const fetchImpl of [
    async () => { throw new Error("private network detail"); },
    async () => ({ ok: true, json: async () => { throw new Error("private JSON detail"); } }),
  ]) {
    await assert.rejects(createOpenAIResponse({ ...base, fetchImpl }), { message: "OpenAI request failed; no output was accepted." });
  }
});

test("timeout aborts the request without retry or provider fallback", async () => {
  let calls = 0;
  await assert.rejects(createOpenAIResponse({ ...base, timeoutMs: 5, fetchImpl: (_url, options) => {
    calls++;
    return new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(new Error("aborted"))));
  } }), /timed out/);
  assert.equal(calls, 1);
});
