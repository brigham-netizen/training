# reviews.brighamredd.com

One static page (`index.html`) listing each business with links to leave a review and follow on social. No build step.

## Editing
Open `index.html` and edit the `VENTURES` list near the bottom. Paste a URL into any `url: ""` to make that button appear; blank ones stay hidden.

**Google review link:** in Google Business Profile, click "Ask for reviews" and copy the short `g.page/r/.../review` link.

## Hosting (pick one)
- **Netlify / Cloudflare Pages:** connect this repo, set the base/publish directory to `reviews`, no build command. Add `reviews.brighamredd.com` as a custom domain.
- **GitHub Pages:** the `CNAME` file is already here; serve from this folder.

DNS: add a `CNAME` record for `reviews` pointing at the host your provider gives you (e.g. `yoursite.netlify.app` or `<user>.github.io`).
