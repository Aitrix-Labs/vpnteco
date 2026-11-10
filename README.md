# Vpnteco

Exact recreation of the [Viresta](https://viresta.webflow.io/) VPN template, branded as **Vpnteco**, delivered as a **React + Vite** SPA that renders the original Webflow markup/CSS.

## Develop

```bash
npm install
npm run dev
```

Open: http://localhost:5181/vpnteco/

## Build

```bash
npm run build
```

Output lands in `dist/` for GitHub Pages at `/vpnteco/`.

## Notes

- `npm run pages` transforms raw Webflow HTML → `site/`, then exports page bodies into `src/generated/pages.ts`
- React Router handles navigation; Webflow CSS/JS keep the original look and interactions
