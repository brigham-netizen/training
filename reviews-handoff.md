# Handoff: reviews.brighamredd.com

## What this is
A one-page static site listing Brigham Redd's businesses, with buttons to **leave a review** (Google Business Profile, Zillow, Airbnb, etc.) and **follow** on social. It's plain HTML/CSS/JS with no build step and no dependencies.

## Current state
- Built and pushed to `brigham-netizen/training` on branch `ccr-ec0eb2de-d93g15`, under `reviews/`. It was never merged to `main`.
- It's moving to its own repo. The cloud session's GitHub connection couldn't create repos, so do it locally.
- **Business list is a guess.** Liftoff Realty, SettleSavvy and Redd House, with guessed taglines. Confirm or replace them.
- **Every link is blank** (`url: ""`). A button stays hidden until it has a link, so right now the cards show names only.
- Not yet checked in a browser.

## Next steps
1. Create a new repo (for example `reviews`). Copy the three files below into its root and push.
2. Fill in the `VENTURES` list in `index.html` with the real businesses and links.
   - Google review link: Google Business Profile → **Ask for reviews** → copy the `g.page/r/.../review` link.
3. Open `index.html` in a browser (or use VS Code Live Server) to check it.
4. Deploy on Netlify or Cloudflare Pages: connect the repo, leave the build command blank, and set the publish directory to `/`.
5. Add the custom domain `reviews.brighamredd.com` in the host, then add a DNS `CNAME` record for `reviews` pointing to the host's address (for example `yoursite.netlify.app`).
6. Optional: delete `reviews/` from the `training` repo branch `ccr-ec0eb2de-d93g15`, or just abandon that branch.

## Files

### `CNAME`
```
reviews.brighamredd.com
```

### `README.md`
````markdown
# reviews.brighamredd.com

One static page (`index.html`) listing each business with links to leave a review and follow on social. No build step.

## Editing
Open `index.html` and edit the `VENTURES` list near the bottom. Paste a URL into any `url: ""` to make that button appear; blank ones stay hidden.

**Google review link:** in Google Business Profile, click "Ask for reviews" and copy the short `g.page/r/.../review` link.

## Hosting (pick one)
- **Netlify / Cloudflare Pages:** connect this repo, set the publish directory to the repo root, no build command. Add `reviews.brighamredd.com` as a custom domain.
- **GitHub Pages:** the `CNAME` file is already here; serve from the repo root.

DNS: add a `CNAME` record for `reviews` pointing at the host your provider gives you (e.g. `yoursite.netlify.app` or `<user>.github.io`).
````

### `index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Leave a Review · Brigham Redd</title>
  <meta name="description" content="Brigham Redd's businesses: leave a review or follow along." />
  <style>
    :root {
      --bg: #f6f5f2; --card: #ffffff; --text: #1a1a1a; --muted: #6b6b6b;
      --line: #e6e4df; --accent: #b4232a; --btn: #f1efea; --btn-hover: #e7e4dd;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0e0e0e; --card: #171717; --text: #ececec; --muted: #9a9a9a;
        --line: #262626; --accent: #ef4444; --btn: #222; --btn-hover: #2c2c2c;
      }
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg); color: var(--text);
      font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      line-height: 1.5; padding: 48px 16px 64px;
    }
    main { max-width: 640px; margin: 0 auto; }
    header { text-align: center; margin-bottom: 36px; }
    header h1 { font-size: 1.9rem; letter-spacing: -0.02em; }
    header p { color: var(--muted); margin-top: 6px; }
    .venture {
      background: var(--card); border: 1px solid var(--line);
      border-radius: 14px; padding: 22px; margin-bottom: 18px;
    }
    .venture h2 { font-size: 1.2rem; }
    .venture .tag { color: var(--muted); font-size: 0.95rem; margin-top: 2px; }
    .venture .site { color: var(--accent); font-size: 0.9rem; text-decoration: none; }
    .venture .site:hover { text-decoration: underline; }
    h3 {
      font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--muted); margin: 18px 0 8px;
    }
    .links { display: flex; flex-wrap: wrap; gap: 8px; }
    .links a {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--btn); color: var(--text); text-decoration: none;
      padding: 9px 14px; border-radius: 999px; font-size: 0.92rem; font-weight: 500;
      border: 1px solid var(--line); transition: background 0.15s;
    }
    .links a:hover { background: var(--btn-hover); }
    .links a.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
    .links a.primary:hover { filter: brightness(1.08); }
    footer { text-align: center; color: var(--muted); font-size: 0.85rem; margin-top: 36px; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Thanks for stopping by</h1>
      <p>Pick a business below to leave a review or follow along. It means a lot.</p>
    </header>
    <div id="ventures"></div>
    <footer>&copy; <span id="year"></span> Brigham Redd</footer>
  </main>

  <script>
    // ─── EDIT THIS LIST ────────────────────────────────────────────────────
    // Add, remove, or reorder businesses here. Any link left as "" is hidden.
    // "primary: true" makes that review button stand out (use it for Google).
    const VENTURES = [
      {
        name: "Liftoff Realty",
        tagline: "Real estate brokerage",
        website: "",
        reviews: [
          { label: "Google", url: "", primary: true },
          { label: "Zillow", url: "" },
          { label: "Facebook", url: "" },
        ],
        socials: [
          { label: "Instagram", url: "" },
          { label: "Facebook", url: "" },
          { label: "LinkedIn", url: "" },
        ],
      },
      {
        name: "SettleSavvy",
        tagline: "Relocation help",
        website: "",
        reviews: [
          { label: "Google", url: "", primary: true },
        ],
        socials: [
          { label: "Instagram", url: "" },
          { label: "Facebook", url: "" },
        ],
      },
      {
        name: "Redd House",
        tagline: "Short-term rental",
        website: "",
        reviews: [
          { label: "Google", url: "", primary: true },
          { label: "Airbnb", url: "" },
        ],
        socials: [
          { label: "Instagram", url: "" },
        ],
      },
    ];
    // ────────────────────────────────────────────────────────────────────────

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    const linkRow = (title, items) => {
      const live = items.filter((i) => i.url);
      if (!live.length) return "";
      return `<h3>${title}</h3><div class="links">${live.map((i) =>
        `<a href="${esc(i.url)}" target="_blank" rel="noopener"${i.primary ? ' class="primary"' : ""}>${esc(i.label)}</a>`
      ).join("")}</div>`;
    };

    document.getElementById("ventures").innerHTML = VENTURES.map((v) => `
      <section class="venture">
        <h2>${esc(v.name)}</h2>
        ${v.tagline ? `<p class="tag">${esc(v.tagline)}</p>` : ""}
        ${v.website ? `<a class="site" href="${esc(v.website)}" target="_blank" rel="noopener">${esc(v.website.replace(/^https?:\/\//, ""))}</a>` : ""}
        ${linkRow("Leave a review", v.reviews || [])}
        ${linkRow("Follow", v.socials || [])}
      </section>`).join("");

    document.getElementById("year").textContent = new Date().getFullYear();
  </script>
</body>
</html>
```
