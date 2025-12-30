# Deploying your app to Cloudflare Pages

This guide explains how to publish the front-end `app` (Vite/React) to Cloudflare Pages and how to embed it into your `prototype.html` preview.

1) Prepare your app
- Make sure your React preview lives in `/app` and has a production build script in `app/package.json` (we added Vite there).
- From the repository root, run:

```bash
cd app
npm install
npm run build
```

2) Push your repo to GitHub (Cloudflare connects to GitHub)
- Commit and push your changes to the `main` branch (or another branch).

3) Create a Cloudflare Pages site
- In Cloudflare dashboard → Pages → Create a project
- Connect your GitHub repository and choose the branch (e.g. `main`).

4) Build settings
- Framework preset: `Vite` (or `None` and set custom commands)
- Build command: `npm install && npm run build`
- Build output directory: `app/dist`
- Root: leave empty or `/`.

5) Environment and routing
- Add environment variables if needed (none required for the basic app)
- Deploy. Cloudflare Pages will build and publish to a `*.pages.dev` URL.

6) Embed the published URL in your prototype
- Copy the published URL (e.g. `https://your-app.pages.dev`).
- Open `prototype.html` in your site (or the Accessibility controls if you added a place to store the URL).
- Paste the URL in the embed field and `Save` — the preview iframe will load the Cloudflare Pages URL.

7) Use full-screen mode
- The prototype page includes a `Fullscreen` button next to the embed field that will expand the embedded app to full screen in supported browsers.

Notes
- If your app relies on server-side APIs, configure CORS and environment variables in Cloudflare Pages.
- For local testing you can use the preview at `/app` (served by the `app` dev server). When embedding a remote pages.dev URL inside an iframe, ensure the deployed site does not set `X-Frame-Options: DENY`.

If you want, I can:
- Add a small CI GitHub Actions workflow to automatically build and deploy to Cloudflare Pages via `wrangler` or `gh-pages`.
- Add a helper in `accessibility.html` to store the Cloudflare URL (if you'd like the single control there).