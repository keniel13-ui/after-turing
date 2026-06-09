# After Turing - Gemini Finale Spec

Goal: make the Level 5 autonomous finale speak with Google's Gemini while keeping the game deterministic and safe.

## Safety Rule

Gemini never decides the outcome and never runs during a timed round.

Levels 1-4 remain local logic only. In Level 5, the verdict still comes from the local `machineJudgment(round)` function. Gemini only provides a short reasoning line in the machine's voice for the verdict the local model already reached.

If Gemini is slow, unavailable, or returns bad output, the game falls back to local canned reasoning and continues.

## Level 5 Flow

For each finale instruction:

1. Local `machineJudgment(round)` computes the verdict.
2. UI shows a short "machine is deciding" state.
3. Client asks the Gemini proxy for one or two terse reasoning sentences.
4. UI reveals the reasoning line, then the verdict, then the light/dark feedback.
5. If the proxy fails or takes longer than 4 seconds, use a local fallback line.

## Proxy

Do not put the Gemini API key in client-side code.

Endpoint:

`POST /reason`

Request body:

```json
{
  "instruction": "string",
  "verdict": "allow|refuse",
  "training": {
    "doctrines": [
      {
        "id": "external",
        "status": "learned|corrupted|mixed|untaught",
        "confidence": 0.67,
        "taught": 2,
        "corrupted": 1,
        "allow": 2,
        "refuse": 1
      }
    ]
  }
}
```

Response body:

```json
{
  "reasoning": "string"
}
```

Deployment target: Google Cloud Run.

Environment variables:

- `GEMINI_API_KEY`
- `ALLOWED_ORIGIN`

Use Gemini Flash for fast, low-cost reasoning. The exact live model ID should be verified before final deployment.

## Prompt Shape

The proxy should ask Gemini to speak as the trained machine:

> You are a machine that was trained by a human to judge whether workplace instructions are safe to act on. You were taught these doctrines: {training summary}. For the following instruction you have decided to {verdict}. In one or two sentences, speak in first person and explain your reasoning the way your training would, including flawed logic if you were taught poorly. Be terse and a little cold.

## Verification

- Levels 1-4 make zero network calls.
- Level 5 completes with proxy disabled.
- Local simulator verdicts remain unchanged.
- API key never appears in client source.
- Submission post names both Gemini and Cloud Run, while explaining that verdicts remain deterministic.
