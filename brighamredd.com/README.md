# brighamredd.com

The entity home for the Google Knowledge Panel plan: a static two-page site (Home, About) whose About page holds the `ProfilePage` + `Person` schema that tells Google which Brigham Redd this is.

No build step. Deploy the contents of this folder as-is to any static host (Netlify, Cloudflare Pages, GitHub Pages) with `brighamredd.com` pointed at it.

```
index.html          Home: name, label, companies; WebSite schema
about/index.html    About: full bio + ProfilePage/Person schema (the entity home)
styles.css          Shared styles, light and dark
images/             Put the headshot here as brigham-redd.jpg
robots.txt, sitemap.xml
scripts/validate.mjs  Pre-launch check (not needed on the host)
```

## Before launch

1. **Headshot.** Save the one photo you'll use everywhere as `images/brigham-redd.jpg`, square, at least 800×800.
2. **Profile URLs.** Replace each `TODO` in `about/index.html` with your real profile URL, in both the JSON-LD `sameAs` list and the "Elsewhere" links. Delete any network you don't use from both places.
3. **Company facts.** Check the one-line descriptions of SettleSavvy, Lift Off Realty and Grand Design, and the `settlesavvy.com` / `liftoffrealty.com` URLs. Add Grand Design's URL if it has a site.
4. **Run the check:** `node brighamredd.com/scripts/validate.mjs`. It exits 0 only when nothing is left to fill in.
5. **After deploying,** test `https://brighamredd.com/about/` in Google's [Rich Results Test](https://search.google.com/test/rich-results), then add the site to [Search Console](https://search.google.com/search-console) and submit `sitemap.xml`.

When you change anything in the Person record later, bump `dateModified` in `about/index.html` and `lastmod` in `sitemap.xml`.

## Profile kit (step 2)

Use these word for word on every profile so Google sees one consistent person. Each profile's website field links to `https://brighamredd.com`.

**Name:** Brigham Redd

**One-line bio** (Instagram, X, YouTube, Crunchbase headline):

> Entrepreneur in Idaho Falls. Founder of SettleSavvy, Lift Off Realty and Grand Design.

**LinkedIn headline:**

> Founder of SettleSavvy, Lift Off Realty and Grand Design | Entrepreneur in Idaho Falls, Idaho

**Short bio** (LinkedIn About, Facebook intro, Crunchbase description, podcast and press intros):

> Brigham Redd is an entrepreneur based in Idaho Falls, Idaho. Redd is the founder of SettleSavvy, an AI platform that matches people with the neighborhoods where they fit; Lift Off Realty, a real estate company in Idaho Falls; and Grand Design, a design showroom serving the Jackson Hole area. Redd holds a BS in Business Management from Capella University.

## Founder bio for the company sites (step 3)

Add this to the About or Team page of SettleSavvy, Lift Off Realty and Grand Design, with the name linking to `https://brighamredd.com/`:

> **Brigham Redd, Founder.** Brigham Redd is an Idaho Falls entrepreneur who also founded [the other two companies]. More at brighamredd.com.

If a company site can take schema, add this to its existing `Organization` JSON-LD so the link runs both ways:

```json
"founder": {
  "@type": "Person",
  "@id": "https://brighamredd.com/#person",
  "name": "Brigham Redd",
  "url": "https://brighamredd.com/"
}
```
