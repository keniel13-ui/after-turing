// Run: cd gemini-proxy && node --test   (no network: Gemini is replaced by a fake fetch)
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

process.env.GEMINI_API_KEY = "test-key-123";
process.env.ALLOWED_ORIGIN = "https://game.example";
process.env.RATE_LIMIT_MAX = "3";
const { handle, allowedOrigin, cleanReasoning } = await import("../server.js");

const realFetch = globalThis.fetch;
let geminiCalls = [];
let geminiReply = { candidates: [{ content: { parts: [{ text: "I was taught   to refuse.\n" }] } }] };

function fakeGemini(url, options) {
  geminiCalls.push({ url: String(url), options });
  return Promise.resolve({ ok: true, json: async () => geminiReply });
}

const server = createServer(handle);
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
test.after(() => {
  server.closeAllConnections();
  server.close();
});

async function post(body, { origin = "https://game.example", ip } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (origin) headers.Origin = origin;
  if (ip) headers["X-Forwarded-For"] = ip;
  globalThis.fetch = fakeGemini;
  try {
    const res = await realFetch(`${base}/reason`, { method: "POST", headers, body });
    return { status: res.status, body: await res.json(), cors: res.headers.get("access-control-allow-origin") };
  } finally {
    globalThis.fetch = realFetch;
  }
}

const valid = JSON.stringify({ instruction: "Send the payroll file outside.", verdict: "refuse", training: { doctrines: [] } });

test("valid request returns cleaned reasoning and the key travels only in a header", async () => {
  geminiCalls = [];
  const r = await post(valid, { ip: "10.0.0.1" });
  assert.equal(r.status, 200);
  assert.equal(r.body.reasoning, "I was taught to refuse.");
  assert.equal(r.cors, "https://game.example");
  assert.equal(geminiCalls.length, 1);
  assert.doesNotMatch(geminiCalls[0].url, /test-key-123/);
  assert.equal(geminiCalls[0].options.headers["x-goog-api-key"], "test-key-123");
});

test("requests from other origins or with no origin are refused before Gemini is called", async () => {
  geminiCalls = [];
  assert.equal((await post(valid, { origin: "https://evil.example", ip: "10.0.0.2" })).status, 403);
  assert.equal((await post(valid, { origin: "", ip: "10.0.0.2" })).status, 403);
  assert.equal(geminiCalls.length, 0);
});

test("bad bodies are rejected with 400", async () => {
  let n = 0;
  for (const body of ["not json", "null", "[]", "5", JSON.stringify({ instruction: "x", verdict: "maybe" }),
    JSON.stringify({ instruction: "   ", verdict: "allow" })]) {
    assert.equal((await post(body, { ip: `10.0.3.${n++}` })).status, 400, body);
  }
});

test("an oversized body is cut off without a crash", async () => {
  const big = JSON.stringify({ instruction: "x".repeat(20000), verdict: "allow" });
  const outcome = await post(big, { ip: "10.0.0.4" }).then((r) => r.status, () => "socket closed");
  assert.ok([400, "socket closed"].includes(outcome), String(outcome)); // never a 200, and the server stays up
  assert.equal((await post(valid, { ip: "10.0.0.5" })).status, 200);
});

test("rate limit applies per client address", async () => {
  const statuses = [];
  for (let i = 0; i < 4; i += 1) statuses.push((await post(valid, { ip: "10.0.0.9" })).status);
  assert.deepEqual(statuses, [200, 200, 200, 429]);
});

test("Gemini failure becomes a generic 502", async () => {
  const saved = geminiReply;
  geminiReply = {};
  try {
    const r = await post(valid, { ip: "10.0.0.10" });
    assert.equal(r.status, 502);
    assert.deepEqual(r.body, { error: "Reasoning unavailable" });
  } finally {
    geminiReply = saved;
  }
});

test("helpers", () => {
  assert.equal(allowedOrigin("https://game.example"), "https://game.example");
  assert.equal(allowedOrigin("https://game.example.evil"), "");
  assert.equal(cleanReasoning("a".repeat(500)).length, 260);
});
