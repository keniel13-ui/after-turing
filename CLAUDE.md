# CLAUDE.md

After Turing is a short browser game (June Solstice Game Jam). Two independent parts:

- `index.html`: the entire game. Inline CSS and one inline `<script>`, no build, no dependencies, no external assets.
  Game data (`doctrines`, `levels`), state, rendering, the timer, the background canvas and the Level 5 reasoning call
  all live in that script.
- `gemini-proxy/`: a tiny Node 20 HTTP service (Cloud Run) that turns a locally computed verdict into one line of
  machine "reasoning" via Gemini. It is not part of the static site (`.vercelignore` excludes it).

## Rules
- Do not edit the story text, level data, verdict logic (`recordTeaching`, `machineJudgment`, `afterTuringDebug`)
  or timer windows without the author. Verdicts are deterministic and local; Gemini never decides them.
- Anything from the network (the proxy's `reasoning`) is inserted with `textContent`, never `innerHTML`.
- The client keeps its local fallback reasoning and 4 s timeout. The proxy keeps CORS, rate limit and its 3.5 s timeout.
- The Gemini key lives only in the proxy's environment (Cloud Run secret), never in the client or the repo.
- The live demo is a separate, newer Vercel deploy and may differ from `index.html` here; check before assuming.

## Commands
```bash
python3 -m http.server 4176          # play at http://localhost:4176
cd gemini-proxy && npm test          # proxy tests, no key or network needed
PORT=8080 node gemini-proxy/server.js  # run the proxy (needs GEMINI_API_KEY for /reason)
```
`window.afterTuringDebug.simulate([...choices])` in the browser console returns the Level 5 verdicts for a teaching
history, which is the quickest way to confirm game logic is unchanged.
