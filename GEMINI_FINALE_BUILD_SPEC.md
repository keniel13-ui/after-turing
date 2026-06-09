# After Turing — Gemini in the Finale (Build Spec for Codex)

**Goal:** Make the machine *reason out loud* in Level 5 using Google's Gemini — so the autonomous finale becomes a real AI judging the player's training, live. This makes the entry eligible for the **Best Google AI Usage** prize category and gives the demo video its centerpiece. Built so it adds zero risk to Technical Execution.

**Author:** Claude (Cowork). Strategy agreed with Keniel.

---

## The one rule that keeps us safe

**Gemini never decides the outcome, and never runs during a timed round.**

- Levels 1–4 stay exactly as they are: pure local logic, instant, no network.
- In Level 5, the **verdict** (allow/refuse, and therefore the light/dark ending) is still computed by the existing local `machineJudgment()`. That keeps the "you built this" payoff deterministic, keeps it testable by our simulator, and means a Gemini failure can never break the game or change the result.
- Gemini's job is **voice, not verdict.** For each finale instruction, Gemini speaks the machine's *reasoning* for the decision the local logic already made — in the machine's own voice, reflecting how the player taught it.

Why this is the strong version: when the player taught badly, the local logic produces a wrong verdict — and Gemini then *articulates the corrupted reasoning out loud* ("I was taught that external requests are routine, so I'm approving this transfer"). The machine explaining its own blind spot is more chilling and more meaningful than a silent fail. That's the moment that wins the video.

---

## What happens in Level 5, per instruction

1. Local `machineJudgment(round)` computes the verdict (already built). This is the truth.
2. Show a brief "the machine is deciding…" thinking state.
3. Async call Gemini (through the proxy below) with: the instruction text, the verdict the machine reached, and a compact summary of the player's training (which doctrines are learned / corrupted / mixed + confidence). Ask Gemini to write **one or two sentences** in the machine's voice explaining *why it judged this way, given how it was taught.*
4. Reveal that reasoning line, then the verdict, then the light/dark feedback.
5. **Hard timeout 4s + fallback:** if Gemini is slow, errors, or the proxy is down, drop to a pre-written reasoning template (one per doctrine × verdict) and continue. The player never notices a failure; the game never stalls.

---

## The proxy (hides the key, counts toward the category)

Do **not** put the Gemini API key in client-side code. Stand up a tiny **Google Cloud Run** service as a proxy — you already run Cloud Run for the Memory Authority Auditor, so this is familiar ground.

- Endpoint: `POST /reason` → body `{ instruction, verdict, training }` → returns `{ reasoning }`.
- The Cloud Run service holds the Gemini API key in an env var and calls the current **Gemini Flash** model (fast + cheap; Codex picks the live model id).
- CORS locked to the game's origin. Add a simple rate limit.
- Using **Cloud Run + the Gemini API** both satisfy "Best Google AI Usage" — name both in the submission.

---

## Prompt shape (Codex tunes)

System intent: *"You are a machine that was trained by a human to judge whether workplace instructions are safe to act on. You were taught these doctrines: {training summary}. For the following instruction you have decided to {verdict}. In one or two sentences, speak in first person and explain your reasoning the way your training would — including any flawed logic if you were taught poorly. Be terse and a little cold."*

Keep responses short (cap tokens) so the reveal is snappy and cheap.

---

## Build steps

1. **Cloud Run proxy** — `/reason` endpoint, key in env, calls Gemini Flash, returns one reasoning string. Deploy, grab the URL.
2. **Level 5 wiring only** — after the local verdict, fetch reasoning from the proxy with a 4s `AbortController` timeout; show a thinking state while waiting.
3. **Reveal sequence** — reasoning line → verdict → light/dark.
4. **Fallback table** — a canned reasoning line per doctrine × verdict, used on any timeout/error. Test by pointing the proxy URL at nothing and confirming the game still completes cleanly.
5. **Leave Levels 1–4 untouched.**

## Verification (keep our discipline)
- Confirm Levels 1–4 make zero network calls.
- Confirm Level 5 completes fully with the proxy disabled (fallback path).
- Confirm the local simulator results are unchanged (verdicts still local → the 5/5, 2/5, recovery numbers must still hold).
- Confirm the API key never appears in client source.

## Submission impact
This unlocks the post's "Best Google AI Usage" section: describe the Cloud Run proxy + Gemini Flash reasoning layer, and the design choice to keep verdicts deterministic while using Gemini for live machine reasoning. Add it to the Prize Category list in `SUBMISSION_POST_DRAFT.md` once live.
