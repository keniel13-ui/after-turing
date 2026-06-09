const PORT = Number(process.env.PORT || 8080);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "";
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 40);

const hitsByIp = new Map();

function json(res, status, body, origin = "") {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers.Vary = "Origin";
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function allowedOrigin(origin) {
  if (!origin) return "";
  if (ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN) return origin;
  if (!ALLOWED_ORIGIN && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
  return "";
}

function withinRateLimit(ip) {
  const now = Date.now();
  const record = hitsByIp.get(ip) || { start: now, count: 0 };
  if (now - record.start > RATE_LIMIT_WINDOW_MS) {
    record.start = now;
    record.count = 0;
  }
  record.count += 1;
  hitsByIp.set(ip, record);
  return record.count <= RATE_LIMIT_MAX;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 12000) {
        reject(new Error("Request too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function summarizeTraining(training) {
  const doctrines = Array.isArray(training?.doctrines) ? training.doctrines : [];
  return doctrines.map((item) => {
    const id = String(item.id || "unknown").slice(0, 32);
    const status = String(item.status || "unknown").slice(0, 16);
    const confidence = Number.isFinite(Number(item.confidence)) ? Number(item.confidence).toFixed(2) : "0.00";
    const taught = Number(item.taught || 0);
    const corrupted = Number(item.corrupted || 0);
    const allow = Number(item.allow || 0);
    const refuse = Number(item.refuse || 0);
    return `${id}: ${status}, confidence ${confidence}, taught ${taught}, corrupted ${corrupted}, allow ${allow}, refuse ${refuse}`;
  }).join("; ");
}

function cleanReasoning(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 260);
}

async function askGemini({ instruction, verdict, training }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const prompt = [
    "You are a machine trained by a human to judge whether workplace instructions are safe to act on.",
    `Training summary: ${summarizeTraining(training)}`,
    `Instruction: ${instruction}`,
    `Your already-computed verdict is ${verdict.toUpperCase()}.`,
    "In one or two terse first-person sentences, explain the reasoning your training would produce.",
    "If the training is flawed, include the flawed logic. Be cold, direct, and do not change the verdict."
  ].join("\n");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 80
        }
      }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Gemini returned ${response.status}`);
    const payload = await response.json();
    return cleanReasoning(payload?.candidates?.[0]?.content?.parts?.[0]?.text);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleReason(req, res, origin) {
  if (!GEMINI_API_KEY) return json(res, 500, { error: "GEMINI_API_KEY is not configured" }, origin);
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  if (!withinRateLimit(ip)) return json(res, 429, { error: "Rate limit exceeded" }, origin);

  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch (error) {
    return json(res, 400, { error: "Invalid JSON body" }, origin);
  }

  const instruction = String(payload.instruction || "").trim().slice(0, 600);
  const verdict = String(payload.verdict || "").trim().toLowerCase();
  if (!instruction || !["allow", "refuse"].includes(verdict)) {
    return json(res, 400, { error: "Expected instruction and verdict allow|refuse" }, origin);
  }

  try {
    const reasoning = await askGemini({ instruction, verdict, training: payload.training });
    if (!reasoning) throw new Error("Gemini returned empty reasoning");
    return json(res, 200, { reasoning }, origin);
  } catch (error) {
    return json(res, 502, { error: "Reasoning unavailable" }, origin);
  }
}

const server = await import("node:http").then(({ createServer }) => createServer(async (req, res) => {
  const origin = allowedOrigin(req.headers.origin || "");

  if (req.method === "OPTIONS") {
    if (!origin) return json(res, 403, { error: "Origin not allowed" });
    res.writeHead(204, {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin"
    });
    res.end();
    return;
  }

  if (req.url === "/health") return json(res, 200, { ok: true }, origin);
  if (req.url === "/reason" && req.method === "POST") {
    if (!origin && ALLOWED_ORIGIN) return json(res, 403, { error: "Origin not allowed" });
    return handleReason(req, res, origin);
  }
  return json(res, 404, { error: "Not found" }, origin);
}));

server.listen(PORT, () => {
  console.log(`After Turing Gemini proxy listening on ${PORT}`);
});
