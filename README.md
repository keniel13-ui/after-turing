# After Turing

After Turing is a short browser game about teaching a machine when to trust, verify, and refuse workplace instructions under pressure.

The player trains the machine across four timed levels. In the final level, the buttons disappear and the machine judges alone based on the doctrine history the player created.

## Play Locally

Open `index.html` in a browser, or serve this folder with any static file server.

```bash
python3 -m http.server 4176
```

Then visit:

```text
http://localhost:4176
```

## Google AI Usage

The core game logic is deterministic and runs locally in the browser. The optional final-level reasoning voice uses Gemini through a separate Google Cloud Run proxy in `gemini-proxy/`. Gemini never decides the game verdict; it only explains the local machine verdict in the machine's voice.

## Deploy Notes

The static site is `index.html`. The `gemini-proxy/` folder is source for the separate Cloud Run service and should not be deployed as part of the static website.
