# Filey ERP — Website

Marketing & download website for **[Filey ERP](https://github.com/iamveer82/Filey-erp)** — the free, open-source (AGPL-3.0), offline-first desktop ERP + CRM for small businesses.

Single long-scrolling landing page with:

- Hero with live, code-built app-window mock and OS-detected download CTA
- Module explorer (10 interactive module tabs)
- "Why Filey" bento (offline-first, AGPL, local PDF tools…)
- Pinned scroll **dashboard preview** (GSAP ScrollTrigger, count-up KPIs, drawing charts)
- **Live in-browser demo** — mini-ERP with 4 working tabs: Dashboard, Invoicing (VAT 5% recompute, template previews), draggable CRM kanban (@dnd-kit), sortable/filterable Inventory
- **Download** section — real v2.2.1 installers (Windows .exe/.msi, Linux AppImage/.deb/.rpm, macOS build-from-source)
- **Run locally** quick-start (5 terminal steps with copy buttons)
- Open-source & tech-stack section, FAQ, final CTA

## Tech

Vite 7 · React 19 · TypeScript · Tailwind CSS 3.4 · shadcn/ui · Recharts · GSAP + ScrollTrigger · Framer Motion · Lenis · @dnd-kit · lucide-react · sonner

## Run locally

```bash
npm install        # no lockfile committed — this generates one
npm run dev        # dev server
npm run build      # production build → dist/
```

## Assets note

`public/mascot.png` and `public/og-cover.png` are generated raster assets. They are not committed to this repo — regenerate them with:

```bash
python3 scripts/generate_assets.py   # requires: pip install pillow
```

`public/logo.svg` is committed. All other visuals (dashboard, charts, invoice, kanban) are built in code — no stock imagery.

## Related

- App repo: https://github.com/iamveer82/Filey-erp
- Releases: https://github.com/iamveer82/Filey-erp/releases
- License of the app: AGPL-3.0
