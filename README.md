# The Sandbox Shift

A concise, vendor-neutral field guide to **why, when, and how** to use execution sandboxes
for AI-authored code — with an interactive *"do you need a sandbox?"* decider.

> Docker made code **portable**. Sandboxes make code **safe to run** — because the author is no
> longer a human you trust. Generation got cheap; **safe execution is the new bottleneck.**

It's a single static page. No build step, no framework, no tracking, no cookies.

## What's inside

- **Thesis** — containers vs sandboxes: the assumption that flipped.
- **Act ① Why** — untrusted author, blast radius, reproducibility, parallelism, state control.
- **Act ② When** — the lifecycle (exec → dev → CI → evals/RL → prod) and the inside-VPC vs
  outside/public-ephemeral trust boundary, as a 2×2.
- **Interactive decider** — four questions → a live verdict, recommended isolation tier
  (highlighted on the ladder), and placement. Pure JS, runs entirely in your browser.
- **Act ③ How** — the isolation ladder (subprocess → namespaces → container → gVisor →
  microVM → full VM) and the operating patterns that apply at every tier.
- **Objections** — honest answers to "isn't this just containers / a VM / hype?"

## Files

| File | Role |
|------|------|
| `index.html` | Structure + content + social meta |
| `styles.css` | Editorial / infographic design system |
| `script.js`  | Scroll reveals, back-to-top, the decider (no deps) |
| `.nojekyll`  | Tells GitHub Pages to serve files as-is |
| `og.png`     | 1200×630 social-share card (Open Graph / Twitter) |
| `og-card.html` | Source for `og.png` — re-render with headless Chrome |

Regenerate the share card after editing `og-card.html`:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --window-size=1200,630 --virtual-time-budget=4000 \
  --screenshot="$PWD/og.png" "file://$PWD/og-card.html"
```

## Run locally

```bash
python3 -m http.server 8765
# open http://localhost:8765
```

Or just open `index.html` directly.

## Deploy to GitHub Pages

1. Push these files to a repo (root).
2. **Settings ▸ Pages ▸ Build and deployment** → *Deploy from a branch* → branch `main`, folder `/ (root)`.
3. Done. `.nojekyll` is already included so the assets serve untouched.

## Credits

Design and storytelling inspired by [`zozo123/intel-story`](https://github.com/zozo123/intel-story).
Vendor-neutral by design — providers are named only as a landscape, not a recommendation.
