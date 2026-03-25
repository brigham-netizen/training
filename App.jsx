# 100-Mile Backyard Ultra Training Plan

A personal training app for Brigham's August 15, 2026 race.

## Deploy to Netlify

### Option A — Drag and Drop (easiest)

1. Install dependencies and build:
   ```
   npm install
   npm run build
   ```
2. Go to [netlify.com](https://netlify.com) and log in
3. Drag the `dist/` folder onto the Netlify deploy area
4. Done — your app is live

### Option B — Connect GitHub (auto-deploys on push)

1. Push this folder to a GitHub repo
2. In Netlify: New site → Import from Git → select your repo
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy — Netlify auto-deploys every time you push

## Run locally

```
npm install
npm run dev
```

Then open http://localhost:5173

## Notes

- All workout progress, notes, and logs are saved to **localStorage** in your browser
- Data persists across sessions on the same device/browser
- To back up your data: open browser DevTools → Application → Local Storage → copy the value for `brigham_plan_v4`
- Data does NOT sync across devices — it lives in whichever browser you use consistently
