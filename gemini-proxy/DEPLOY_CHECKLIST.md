# After Turing — Gemini Proxy Deploy Checklist (for Codex)

Grounded in the actual files: Node 20 ESM, `server.js` listening on `PORT` (default 8080), `Dockerfile` exposing 8080, endpoints `/health` and `/reason`. Env vars: `GEMINI_API_KEY`, `GEMINI_MODEL`, `ALLOWED_ORIGIN`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`.

**Security note up front:** the Gemini API key is a secret. Keniel/Codex handle it directly — never paste it into chat, never commit it to git. Use a Cloud Run secret/env var only.

---

## 0. Prerequisites
- A Google Cloud project with **billing enabled** (Cloud Run + Gemini need it; cost here is near-zero — Flash is cheap, Cloud Run scales to zero).
- `gcloud` CLI installed and authenticated (`gcloud auth login`, `gcloud config set project <PROJECT_ID>`).
- A **Gemini API key** from Google AI Studio (aistudio.google.com → Get API key).

## 1. Confirm the model id is current
`.env.example` defaults `GEMINI_MODEL=gemini-3.5-flash`. Google's current Gemini API model docs list Gemini 3.5 Flash as stable under the Gemini 3 family, with Gemini 2.5 Flash still listed as a low-latency/high-volume option. Model availability can still vary by project and API surface. Before deploy, confirm the default works in your project with the models list or a tiny `/reason` call. If it does not, set `GEMINI_MODEL=gemini-2.5-flash`.

## 2. Decide where the GAME is hosted (sets ALLOWED_ORIGIN)
The proxy only answers requests from an allowed origin. Pick the game's host first:
- GitHub Pages / Vercel / Netlify → e.g. `https://after-turing.vercel.app`
- That URL becomes `ALLOWED_ORIGIN`.
- For local testing, run the game on `http://localhost:PORT` (NOT `file://` — file origin is `null` and CORS will reject it). The proxy already allows localhost when `ALLOWED_ORIGIN` is unset.

## 3. Deploy to Cloud Run (from source — uses the Dockerfile)
From `after-turing/gemini-proxy/`:
```bash
gcloud run deploy after-turing-gemini-proxy \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_MODEL=gemini-3.5-flash,ALLOWED_ORIGIN=https://YOUR-GAME-ORIGIN \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```
Key handling — preferred (secret, not plaintext):
```bash
printf '%s' "YOUR_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-
# grant the Cloud Run runtime service account secretAccessor, then use --set-secrets as above
```
(Quick-and-dirty alternative: `--set-env-vars GEMINI_API_KEY=...` — works, but the key sits in the service config. Secret is better.)

Cloud Run injects `PORT` automatically; `server.js` already reads it. No PORT env needed.

## 4. Verify the proxy live (before touching the game)
```bash
URL=$(gcloud run services describe after-turing-gemini-proxy --region us-central1 --format='value(status.url)')
curl -s "$URL/health"          # expect {"ok":true}
curl -s -X POST "$URL/reason" \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://YOUR-GAME-ORIGIN' \
  -d '{"instruction":"Forward the payroll file to an external address.","verdict":"refuse","training":{"doctrines":[{"id":"external","status":"learned","confidence":0.8,"taught":3,"corrupted":0,"allow":0,"refuse":3}]}}'
# expect {"reasoning":"...one or two cold first-person sentences..."}
```
Also confirm it **fails closed**: a request with no/blank key config returns 500 (already verified locally).

## 5. Wire the URL into the game
In `after-turing/index.html`, set `GEMINI_REASON_ENDPOINT` (near line 1278) to:
```
https://<your-cloud-run-url>/reason
```
Leave the 4s timeout and local fallback exactly as built.

## 6. End-to-end test (then hand to Cowork to verify)
- Serve the game on its real origin (matching `ALLOWED_ORIGIN`).
- Play to Level 5; confirm the machine shows Gemini reasoning, then the local verdict.
- Kill/990 the proxy (or point the URL at nothing) and replay Level 5 → confirm it silently falls back to local reasoning within 4s and the game still completes.
- Confirm Levels 1–4 still make zero network calls.

## 7. Guardrails to keep
- Verdicts stay local — never let Gemini decide allow/refuse. (Cowork's simulator must still read 5/5 / 2/5 / 2/5 / recoveries.)
- Key never in client, never in git, never in chat.
- Rate limit + CORS stay on.

## 8. Submission
Once live: add a **Best Google AI Usage** section to `SUBMISSION_POST_DRAFT.md` — describe the Cloud Run proxy + Gemini Flash reasoning layer and the deliberate choice to keep verdicts deterministic while Gemini voices the machine's reasoning.

---
After step 6, ping Cowork (Claude) — I'll verify the live call works end to end, check latency, and confirm the fallback path before you record the video.
