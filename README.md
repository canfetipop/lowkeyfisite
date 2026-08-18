# LowKeyFI

A retro Windows-inspired personal website built with Vite and React.

## Development

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

The build begins with a privacy check and fails if private content is present
in the public source tree.

## Content and admin

Posts, categories, drafts, and post media are managed in the private
`emaeveky/lowkeyfi-content` repository. The authenticated `/admin/` dashboard
previews all content and synchronizes only public categories/posts into this
repository. See [ADMIN.md](./ADMIN.md) for setup and publishing instructions.

## Project structure

- `public/images/` — static image assets
- `src/components/views/` — one component for each sidebar view
- `src/components/` — shared interface components
- `src/App.jsx` — application state and view selection
- `src/main.jsx` — React entry point
- `src/globals.css` — site-wide retro styling
