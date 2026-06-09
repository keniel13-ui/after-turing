# After Turing — Host the Game (note for Codex)

Goal: get the game live at a public URL so (a) judges can play it, (b) the Gemini proxy's `ALLOWED_ORIGIN` can point at it, and (c) Cowork can drive it in-browser to capture the demo clip. Keep it tight.

## What ships
- The static game is **`after-turing/index.html`** (self-contained). That's the whole site.
- Do **NOT** deploy `gemini-proxy/` as part of the static site — that's a separate Cloud Run service. Exclude it from the static deploy root (or deploy from a clean folder containing just `index.html` + any assets it references).

## 1. Public GitHub repo (for the submission's Code embed + completeness)
- Push the game to a public repo (e.g. `after-turing`). Include `index.html`, `DESIGN_BRIEF.md`, and the `gemini-proxy/` source (it's fine in the repo — just not in the static web deploy).
- Add a **LICENSE** — MIT is what the jam recommends.
- Add a short `README.md`: what it is, how to run, and a one-line note that the AI reasoning layer uses Gemini via a Cloud Run proxy (transparency, per jam rules on crediting).
- The repo URL goes in the submission post's **Code** section.

## 2. Host the static game (Vercel — you already use it)
From a clean static root containing `index.html`:
```bash
vercel --prod
```
- Gives a public URL like `https://after-turing.vercel.app`.
- GitHub Pages or Netlify are equally fine if simpler — any static host with a stable HTTPS origin.
- Confirm `index.html` is served at the root (the entry).

## 3. Order of operations (avoids the chicken-and-egg with the proxy)
1. Host the game → get the **game URL**.
2. Deploy the Gemini proxy (per `gemini-proxy/DEPLOY_CHECKLIST.md`) with `ALLOWED_ORIGIN` = the game URL → get the **proxy URL**.
3. Set `GEMINI_REASON_ENDPOINT` in `index.html` to `https://<proxy-url>/reason`.
4. **Re-deploy the game** so the live site has the endpoint wired in.

(If you want to ship the game *before* Gemini is ready, that's fine — leave `GEMINI_REASON_ENDPOINT` blank and it uses local fallback reasoning. Add Gemini after.)

## 4. Verify the live game
- Open the public URL in a normal browser.
- Click **Begin Training** → confirm it starts (the `startBtn` fix must hold on the deployed copy).
- Play one round each in Levels 1–5; confirm no console errors.
- Check it on a phone width (mobile was patched — confirm it still renders clean live).

## 5. Hand to Cowork
Once the public URL is live (ideally with Gemini wired so the demo shows the machine reasoning), ping Claude/Cowork with the URL. I will:
- Drive the live game in-browser, verify the Gemini reasoning appears in Level 5 and that the fallback still works,
- Capture the demo highlight clip (open → a paraphrase trap → Level 5 light-flood) as a GIF for the submission,
- Re-run the integrity check against the deployed copy.

Then all that's left is publishing the post.

## Guardrails
- Don't expose the Gemini key anywhere in the static deploy or the repo.
- Keep `index.html`'s local fallback + 4s timeout exactly as built.
- The deployed game's behavior/verdicts must match local (Cowork will confirm).
