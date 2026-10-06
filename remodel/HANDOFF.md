# House Fit Calc: handoff for SettleSavvy integration

House Fit Calc compares two homes by what each one really costs a buyer:

**House Fit cost = list price + move-in updates + commute × years + neighborhood gap**

It has two branded views (Lift Off Realty and SettleSavvy), agent price requests, and white-label agent links.

- **Prototype:** https://claude.ai/artifact/PGLiNUV2oYXBHnxcEuDF2W
- **Source:** `remodel/index.html` on branch `ccr-be5e174a-hmepqh` of `brigham-netizen/training`

It's one self-contained file of HTML, CSS and plain JS with no build step. To run it locally, open the file in a browser, or run `npm run dev` from the repo root and go to `/remodel/`.

## How the code is laid out

All the code is in `remodel/index.html`, in this order:

| Section | What it holds |
|---|---|
| `DATA` | Cost data for the Idaho Falls area (Homewyse, Angi/HomeAdvisor and Fixr ranges per unit), collected October 2026. Includes the location factor of 0.92 from Craftsman 2025. |
| `MARKET`, `AGENTS`, `ITEMS`, `CATEGORIES` | Config: the market, the agent roster, and the 25 update line items with their units, default quantities and agent-request wording. |
| `DEFAULT_PREFS`, `state`, `load()`, `save()` | Buyer state, currently kept in `localStorage` under `lor-housefit-v1`. |
| Pricing: `sourceRates`, `rate`, `line`, `updatesTotal` | Blends the three published sources, plus agent bids for the market, at the budget, mid or upper finish level. |
| `commuteAnnual`, `nbhdGap`, `fit` | Commute cost, the neighborhood adjustment and the House Fit total. |
| Render: `header`, `stepHomes`, `stepCond`, `stepReport`, `tune`, `inboxCard`, `footer` | The three-step flow: Homes → Condition → Compare. |
| `requestInput`, `answer`, `lockNbhd`, `connect` | Everything that touches the shared database. |

The two brands are set with `data-brand="lor"` or `data-brand="ss"` on the page's root element. The SettleSavvy tokens follow the brand guidelines exactly: teal #089A9A and #067373, coral gold #F48B5A, Manrope and Inter.

## Integrations to finish

### 1. Neighborhood scores and commute from the SettleSavvy map

- **Now:** each home has `nbhd` (1–100), `miles` and `mins` (one-way commute), typed in by the buyer. Commute is set by `state.commute = { on, place, days }`.
- **To do:** fill these from the buyer's SettleSavvy map so they don't have to type them. Keep the inputs as manual overrides.
- **Shape to send in:**
  ```json
  { "homes": [ { "id": "a", "address": "…", "price": 389000, "sqft": 1850, "nbhd": 72, "miles": 3.1, "mins": 9 } ],
    "commute": { "on": true, "place": "INL", "days": 5 } }
  ```
- **Missing scores:** `scoreCta()` shows a "Get my neighborhood scores" button that links to `ssLink()`. Point `SS_MAP_URL` at the real map or sign-up page and match the parameter names your system expects. Right now it sends `agent`, `name` and `utm_*`.

### 2. White-label agent links

- **Format:** `…#agent-<slug>`, for example `#agent-brigham-redd`. The prototype uses the hash only because artifact pages can't read query strings. On your own site, use `?agent=` or a path such as `/fit/brigham-redd`.
- **How the tag travels:** the first agent tag is stored on the buyer as `state.ref`. It's added to SettleSavvy links (`agent=<slug>`, `utm_content=white-label`), agent requests (`agentRef`) and location-value records (`agentRef`).
- **Agent roster:** `AGENTS` maps each slug to name, role, email, phone and photo. Brigham's headshot is embedded as a data URI. Load the roster from your agent records, and fill in the phone number, since it's also where requests get texted.

### 3. Agent price requests by text (GoHighLevel)

- **Now:**
  - "Request agent input" writes a `requests` record with `status: "pending"` and an `sms` object containing `to`, `agent`, `body` and `status: "queued"`.
  - Agents answer in an in-page inbox with "Send number" or "Pass".
  - An answer sets `status` to `answered` or `passed` and adds an `agentBids` record.
  - The buyer's page listens for the answer and applies it to that update immediately.
- **To do:**
  - Send `sms.body` to the agent through a GHL workflow or webhook.
  - Turn the agent's reply into the same update: a number means `answered` plus an `agentBids` record, and "pass" means `passed`.
- **Message text:** `"<client> has requested your input on what <item.ask> would cost in this area. Reply with a number or "pass" if you have no insight on the upgrade."`

### 4. Recording location values

- **What's recorded:** "Lock in" writes one record per buyer in `locationValues/<userId>`. It holds `value` ($ per point), `market`, `agentRef`, `brand`, `scores[]`, `prices[]`, `gap`, `lockedAt` and the last 20 values in `history[]`.
- **Who can read it:** only editors (owner and agents). Each buyer can write only their own record.
- **To do:** move this into your analytics or CRM. In GHL, a custom field on the contact would let you segment buyers by how much they value location.

### 5. Commute methodology

`commuteAnnual()` is a placeholder:

`days per week × 48 weeks × 2 trips × (miles × $0.70 + minutes ÷ 60 × $25 per hour)`

Swap in the House Fit commute methodology here. The years multiplier (`prefs.years`, default 7) and the line item on the compare page stay as they are.

## Replacing the artifact database

The prototype uses the artifact database through `claude.use("db")` and `claude.use("user")`. Map it to your backend like this:

| Prototype | Replace with |
|---|---|
| `requests` collection | Agent request table, plus the GHL SMS bridge |
| `agentBids` collection (`market`, `item`, `value`) | Market price book: per-item agent bids, averaged into rates as one more source |
| `locationValues/<user>` | Buyer location-value records or a CRM field |
| `user.id()` / `user.canEdit()` | Your auth: buyer id, and an agent/admin role |
| `localStorage` comparison state | The buyer's saved comparison on their account |

## Other loose ends

- **Cost data:** there's no Homewyse figure for the panel, radon or basement lines, and no Angi figure for appliances. The sources disagree widely on basement finishing, concrete, countertops and interior paint, which are good first targets for agent bids. Notes on each source are in `DATA`.
- **Location factor:** national sources are scaled by 0.92 (Idaho Falls is 8% below the national average per Craftsman 2025). Homewyse is already priced by ZIP code. A second market needs its own `DATA` block and factor.
