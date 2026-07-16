# Client Workshop Container

One AEM Edge Delivery repo that hosts many **client homepage concepts** side by
side. Each client (prospect) lives in its own content folder off the root and
gets its own scoped CSS/JS, while all blocks and scripts are shared.

```
https://main--experience-workshop-aem-eds-bwb--bwb1066.aem.live/ptc/index
https://main--experience-workshop-aem-eds-bwb--bwb1066.aem.live/analog-devices/index
https://main--experience-workshop-aem-eds-bwb--bwb1066.aem.live/yale-new-haven-health/index
```

## How isolation works

The authorkit runtime (`scripts/ak.js`) has a built-in **template** system:

- A page with page metadata `template: ptc` causes ak.js to
  - load `templates/ptc/ptc.css`, and
  - add the class `ptc-template` to `<body>`.
- `scripts/lazy.js` additionally imports `templates/ptc/ptc.js` if it exists
  (optional per-client JS), and boots the Brand Concierge chat when a page sets
  `concierge-site` (see `scripts/brand-chat.js`).

Because every client rule is written under `body.<client>-template`, clients
can never style each other. Name the **template the same as the content folder**.

## Onboard a new prospect

1. **Template** — copy the starter and rename:
   ```
   cp -r templates/client-starter templates/ptc
   mv templates/ptc/client-starter.css templates/ptc/ptc.css
   mv templates/ptc/client-starter.js  templates/ptc/ptc.js   # or delete if CSS-only
   ```
   In `ptc.css`, change the scope selector to `body.ptc-template` and set the
   brand tokens from the prospect's real homepage. Style the standard blocks
   (`hero`, `columns`, `card`, …) to match their look.

2. **Content** — author the homepage in DA at `/ptc/index`
   (https://da.live/#/bwb1066/experience-workshop-aem-eds-bwb). Build it from the
   prospect's existing homepage. Put design explorations under
   `/ptc/drafts/concept-aa`, `/ptc/drafts/concept-bb`, etc.

3. **Page metadata** (Metadata block or page properties on that page):

   | key | value | effect |
   |-----|-------|--------|
   | `template` | `ptc` | loads `templates/ptc/*`, adds `body.ptc-template` |
   | `concierge-site` | `ptc` | enables Brand Concierge chat (bubble) |
   | `header` | `off` | *(optional)* removes the shared nav for a bespoke hero |
   | `concierge-trigger` | `false` | *(optional)* hide the chat bubble |

4. **Brand chat config** — create a `brand_configs` row with `site_key: ptc` in
   Brand Chat Studio (theme, voice, contact, product catalog, etc.). The widget
   loads live from GitHub Pages, so no code lands in this repo.

5. **Preview/publish** — DA content only reaches the edge after a **Preview**
   (and Publish) in the sidekick/DA. Nothing renders on `*.aem.page` until then.

## Local development

```
npm install
npx @adobe/aem-cli up --no-open
```

`aem up` serves your local code with content proxied from the preview backend,
so you can iterate on `templates/<client>/*.css` against the real page.
