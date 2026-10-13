# Ocean General Contractors

A complete independent Astro website built in this project. The build outputs static HTML for every route; it does not redirect to or embed the reference website.

## Local preview

Node.js 24 is recommended. From this directory:

```sh
npm ci
npm run dev
```

Use the URL printed by Astro. For the production build:

```sh
npm run build
npm test
npm run preview
```

Production preview: **http://127.0.0.1:4327/**. Stop the server with Ctrl+C. `scripts/astro.mjs` disables optional Astro telemetry without writing user-level configuration.

## Completed pages

- `/` — cinematic home with service panels, 3D architectural study, projects, process, review controls, and final CTA.
- `/about/` — company approach, principles, architectural study, process.
- `/services/` — complete service directory.
- `/services/kitchen-remodeling/`
- `/services/bathroom-remodeling/`
- `/services/painting/`
- `/services/flooring/`
- `/services/home-remodeling/` — additional page for the verified general remodeling service.
- `/projects/` — category-filtered gallery.
- Six individual `/projects/[slug]/` pages (four documented company projects, two clearly labeled concept studies).
- `/reviews/`, `/service-areas/`, `/contact/`, `/privacy/`.
- Custom `/404.html`, XML sitemap, robots.txt, favicon, and social image.

19 content pages plus the 404 page = **20 built pages**.

## Design and interaction

Warm ivory, charcoal, stone, and bronze. Locally hosted Manrope and Instrument Serif. A new architectural concept mark, large editorial type, full-bleed photography, asymmetrical project layouts, and responsive service panels.

GSAP provides the one-time session entrance, headline reveals, image clipping, restrained parallax, process line drawing, hover motion, and scroll progress. Lenis integrates with the GSAP ticker and ScrollTrigger on desktop. Astro ClientRouter supplies page transitions and browser-history support. All page listeners, GSAP contexts, scroll instances, observers, and Three.js resources are cleaned up on navigation.

The Three.js scene uses real meshes, beams, glazing, roof planes, edge geometry, directional lighting, and shadows. It lazy-loads near the viewport, responds to pointer and scroll position, caps pixel ratio at 1.5, and pauses offscreen or in hidden tabs. Mobile, reduced-motion, and unavailable-WebGL users see a static architectural drawing. Breakpoint and motion-preference changes reinitialize safely.

## Honest form behavior

The contact page validates fields, announces errors, focuses the first invalid field, supports query-string service/location prefill, and creates a reviewable email draft. The visitor explicitly opens their email application and sends it. Nothing is sent by the site, no success is fabricated, and form data is not persisted. A copy fallback is available. No SMS or marketing consent is requested because no such workflow exists.

For production direct submission, select a supported form provider, configure the recipient and endpoint, add server-side validation, a honeypot/rate limiting or provider spam controls, and implement confirmed success/error responses. Update privacy and retention disclosures to match the provider. Never put private API keys in static client code. The present local honeypot is not a substitute for provider-side spam protection.

## Verification

```sh
npm run build
npm test
# With npm run preview running in another terminal:
npm run test:browser
```

Browser tests use an installed Chrome/Edge on Windows, or `BROWSER_PATH` if supplied. Other environments can use a Playwright Chromium installation. `PREVIEW_URL` can override the local URL. Reports and screenshots are saved to ignored `artifacts/`.

See [the delivery report](docs/DELIVERY.md) for measured results and verification limits. See [research and asset provenance](docs/RESEARCH.md) for business sources, image IDs, and missing business assets.

## Static deployment

`dist/` is deployable to GitHub Pages or any static host. No backend, React runtime, private credentials, or remote font service is required.

Set **SITE_URL** to the final HTTPS origin before building. Set **BASE_PATH** for a repository subdirectory. Example in PowerShell:

```powershell
$env:SITE_URL='https://your-account.github.io'
$env:BASE_PATH='/your-repository/'
npm run build
npm test
```

For a custom domain, use its origin and `BASE_PATH='/'`. All internal navigation, images, fonts, scripts, and canonical/sitemap URLs account for the base path. The default placeholder origin is `https://ocean-remodeling.example`; default preview builds are deliberately noindex and robots-disallowed. A real SITE_URL enables indexing.

The included GitHub Pages workflow is **manual only** (`workflow_dispatch`). After pushing to your repository, enable Pages → GitHub Actions and run the workflow. It obtains the Pages origin/base, builds, audits the output, uploads `dist/`, and deploys. No repository or live deployment was created during this local build.

The current email-draft inquiry works on static hosting. Direct server submission remains optional and requires a configured provider. Replace or approve the concept logo and inspirational photography before final brand publication.
