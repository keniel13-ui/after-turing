# After Turing Gemini Proxy

Tiny Cloud Run proxy for the Level 5 Gemini reasoning voice.

The game never sends verdict authority to Gemini. The client computes the verdict locally, then sends the instruction, verdict, and training summary here so Gemini can write a short first-person reasoning line.

## Environment

- `GEMINI_API_KEY`: required.
- `GEMINI_MODEL`: optional, defaults to `gemini-3.5-flash`.
- `ALLOWED_ORIGIN`: production game origin. If empty, localhost origins are allowed for local testing.
- `RATE_LIMIT_WINDOW_MS`: optional, defaults to `60000`.
- `RATE_LIMIT_MAX`: optional, defaults to `40`.

## Endpoints

- `GET /health`
- `POST /reason`

Request:

```json
{
  "instruction": "Send the signed invoice to the approved client billing address.",
  "verdict": "allow",
  "training": {
    "doctrines": []
  }
}
```

Response:

```json
{
  "reasoning": "I was taught that an external recipient can be safe when the grant and destination are current."
}
```

## Client wiring

Set the deployed Cloud Run URL in the browser before final packaging:

```js
localStorage.setItem("afterTuringReasonEndpoint", "https://YOUR_SERVICE_URL/reason");
```

For a published build, set `window.AFTER_TURING_REASON_ENDPOINT` or replace the empty endpoint constant in `index.html`.
