# The Sandbox Shift

A concise field guide for software, ML and AI-research engineers on **why, when, and how** to run
AI-written code in execution sandboxes, with an interactive *"do you need a sandbox?"* decider.
By Yossi Eliaz. Read it at **https://zozo123.github.io/sandboxes-why-how-when/**.

> Docker made code **portable**. Sandboxes make code **safe to run** — because the author is no
> longer a human you trust. Generation got cheap; **safe execution is the new bottleneck.**

It's a single static page. No build step, no framework, no tracking, no cookies.

## What's inside

- **Thesis** — containers vs sandboxes: the assumption that flipped (then / now).
- **01 Why** — untrusted author, bounded blast radius, reproducibility at scale.
- **A wall, and a workbench** — the sandbox as the whole computer an agent works inside.
- **02 When** — four common jobs (dev, test/eval, deploy, parallel), the same primitive by role
  (SWE / MLE / AI researcher), and the inside-VPC vs outside trust boundary.
- **03 How** — the isolation ladder (subprocess → namespaces → container → gVisor →
  microVM → full VM) and its trade-offs.
- **Decide** — four questions → a live verdict, recommended isolation tier
  (highlighted on the ladder), and placement. Pure JS, runs entirely in your browser.
- **Objections** — answers to "isn't this just containers / a VM / hype?"
- **The landscape** — providers named, with a disclosure of the author's employer.

## Files

| File | Role |
|------|------|
| `index.html` | Structure + content + social meta |
| `styles.css` | Editorial / infographic design system |
| `script.js`  | Scroll reveals, the audience toggle, the decider (no deps) |
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
The why / when / how is provider-agnostic; the landscape names providers, including the author's employer (islo.dev).
microVM boot and density figures are from the [Firecracker project](https://firecracker-microvm.github.io/).
