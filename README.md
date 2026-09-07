# Filey ERP website

The marketing, account-registration and download site for [Filey ERP](https://github.com/iamveer82/Filey-erp), published at [gofiley.com](https://gofiley.com). This repository builds the website; the desktop application lives in a separate repository.

## Development

Use a Node.js version supported by Vite 7 and the committed `package-lock.json`.

```sh
npm ci
npm run dev
```

The development server uses port 3000, normally [http://localhost:3000](http://localhost:3000). To check the production build:

```sh
npm run build
npm run preview
```

`build` runs TypeScript checks and writes the static site to `dist/`. Validation commands:

```sh
npm run lint
node --test scripts/*.test.mjs
```

The checks use Node's built-in test runner and the installed TypeScript compiler. They cover installer selection and safe fallback URLs, anchor navigation, registration controls during pending requests, demo navigation, invoice totals and draft validation, chart reconciliation, CRM stages, stock movements, and the 3D paper positions. They do not contact GitHub or create accounts. The demo and scene tests import TypeScript directly, requiring Node 22.18 or newer.

## Structure

The site uses React 19, TypeScript and Vite 7. React Router serves `/`, `/signup` and a not-found page. Tailwind and existing Radix UI components support forms and dialogs; the marketing design uses shared CSS tokens and section styles.

- `src/pages/Home.tsx` composes `Hero`, `ProductStory`, `Pricing`, `Download` and `Faq`.
- `src/components/Layout.tsx` supplies navigation, footer and progressive section reveals.
- `src/site.css` defines the shared light/dark palette, typography, pill buttons and responsive layouts. `Hero.css`, `LiveDemo.css`, `Download.css` and `FreedomContact.css` handle their respective sections.
- `src/sections/ProductStory.tsx` contains product, AI-example and next-update content, including the interactive demo.
- `src/sections/LiveDemo.tsx` supplies a desktop-style sidebar, section search and an internally scrolling workspace. It starts on Overview and connects its invoice actions to the invoice list/editor. The fixed workspace height prevents later page anchors from moving when lazy sections load.
- `src/lib/useLatestRelease.ts` resolves published desktop installers. `src/lib/constants.ts` holds public project links.
- `src/pages/SignUp.tsx` and `src/lib/signup.ts` implement email/password registration and email-code verification. Registration connects to Supabase; the demo does not.
- `src/components/FreedomContact.tsx` sends an explicitly submitted enquiry to the existing `lead-contact` Supabase function. It is a contact flow, not an online checkout.

The demos reproduce the current ERP working tree's Overview, Invoicing, CRM and Inventory layouts using sample records. The shared demo tokens and navigation follow the desktop app's `src/index.css` and `src/components/Layout.tsx`; individual screens follow their corresponding ERP page files. Changes reset when switching demo sections; they are not saved to an ERP account. The preview is labelled as the next desktop update, since public installers can have older screens. AI examples are illustrative and make no provider requests.

## Assets and motion

The active website uses the committed `public/filey-mark.png` brand asset and self-hosted `public/inter-latin-variable.woff2`. Inter's copyright and SIL Open Font License are included in `public/inter-OFL.txt`. These assets do not need a generation step to build the site. Product previews, charts and document examples are rendered in code.

Scrolling remains native. GSAP ScrollTrigger drives five feature papers emerging from the folder, with a fan on large desktops and a sequential reveal on narrower screens at least 560px tall. A lazy Three.js scene adds curved papers, perspective and depth; its text textures use the same feature copy as the accessible HTML. Rendering is scheduled only when the scene changes and pauses offscreen. WebGL failure retains the HTML animation; short viewports and reduced motion use a readable static layout. Section reveals use IntersectionObserver. The appearance toggle persists a preference locally and otherwise follows the system theme, including on signup.

## Account configuration

Registration uses the existing Filey Supabase project by default. A different deployment can supply these build-time environment variables:

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL used by website registration. |
| `VITE_SUPABASE_ANON_KEY` | Public publishable/anonymous client key for that project. |

Configure values in the build environment or Vercel project settings and rebuild after changing them. Vite exposes `VITE_` values to the browser: never use a Supabase service-role key, management access token, Resend secret or other private credential here. The Freedom enquiry endpoint is configured separately in `FreedomContact.tsx`; changing registration variables does not redirect that form.

Email delivery, enabled auth methods, templates and rate limits are configured in Supabase. The website does not configure or test those hosted settings during its build. Do not send real signup or contact submissions as part of routine UI checks.

## Downloads and release status

As verified on **7 September 2026**, the latest public desktop release is [v2.10.2](https://github.com/iamveer82/Filey-erp/releases/tag/v2.10.2). It includes Windows x64 `.exe`/`.msi`, Linux x64 `.deb`/`.rpm`, and an Apple Silicon macOS `.dmg`. Do not infer an AppImage or an Intel Mac package from platform names.

The site reads the [GitHub latest-release API](https://api.github.com/repos/iamveer82/Filey-erp/releases/latest), sharing one request across consumers. Buttons and sizes come from actual assets in that response. If the API fails or an installer is missing, the fallback is the [latest release page](https://github.com/iamveer82/Filey-erp/releases/latest), never an invented or pinned installer URL. No GitHub token is needed.

The redesigned CRM, Reports-only section insights, connected Overview charts, unlimited local invoicing on Free, and expanded country/tax settings described as **coming in the next update** belong to the ERP working tree and are not features newly delivered by the v2.10.2 installers. Keep that distinction until a corresponding desktop release has been built, validated and published. Website changes do not build, upload or publish desktop installers, run ERP migrations, or activate hosted email configuration.

## Deployment

This repository already has a GitHub-to-Vercel integration. The `main` branch has deployed to both `go-filey/filey-erp-website` and `go-filey/my-project`; check both deployment statuses after a production update. The public domain is `gofiley.com`. Confirm its project assignment in Vercel before changing domain or project configuration.

The existing setup uses the Vite build (`npm run build`) and the `dist/` output. `vercel.json` rewrites application routes to `index.html`, allowing `/signup` and the client-side not-found page to load directly. Asset paths and Vite's base are configured for deployment at the domain root.

Review and validate changes on a branch. If Vercel creates a branch preview, check its desktop/mobile layouts, keyboard navigation, dark appearance, reduced-motion behavior, demo interactions, download fallback and registration entry screen before merging. Merging to `main` uses the existing production integration; monitor GitHub's Vercel statuses and verify the live domain afterward. Publishing this website is independent of releasing the desktop app.

## Related

- [Desktop app repository and documentation](https://github.com/iamveer82/Filey-erp)
- [Desktop releases](https://github.com/iamveer82/Filey-erp/releases)
- [Issues and feedback](https://github.com/iamveer82/Filey-erp/issues)
- [Desktop app license: AGPL-3.0](https://github.com/iamveer82/Filey-erp/blob/main/LICENSE)
