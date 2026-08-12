# Meter Down

**An immersive motion portrait of Kolkata's yellow Ambassador taxis.**

Meter Down places the visitor in the back seat of an Ambassador while Kolkata moves beyond the windscreen. The current public release is a static, art-first homepage built with Vite. Archive and submission features are disabled until the underlying records are ready for publication.

## Current experience

- Fullscreen 720p motion scene with a two-layer crossfade loop
- Responsive desktop and mobile framing
- Yatra One display typography, bundled locally
- Radio Kolkata playback controls
- In-page play/pause and 10-second rewind/forward controls
- About panel with keyboard and backdrop dismissal
- No API, database, account, or server runtime required
- `prefers-reduced-motion` support

The public footer displays **ARCHIVE COMING SOON**. Taxi records, memories, submissions, and moderation are not exposed in this release.

## Project structure

```text
frontend/              Current public Vite application
  public/assets/       Hero video and poster image
  src/                 Homepage JavaScript and styles
  dist/                Generated production build

backend/               Dormant FastAPI/SQLite archive prototype
.github/workflows/     GitHub Pages deployment workflow
ART_DIRECTION.md       Visual direction and design principles
```

The deployable site is entirely contained in `frontend/`. The `backend/` directory is not required to run or host the current release.

## Run locally

Requirements:

- Node.js 22 or later
- npm

Install dependencies and start Vite:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally:

```text
http://127.0.0.1:5173/
```

Build and preview the production output:

```bash
cd frontend
npm run build
npm run preview
```

The production preview normally runs at:

```text
http://127.0.0.1:4173/
```

## GitHub Pages deployment

The repository includes [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml). It builds and publishes `frontend/dist/` whenever a commit is pushed to `main`.

1. Push this repository to GitHub.
2. Open **Settings > Pages** in the repository.
3. Set **Source** to **GitHub Actions**.
4. Push to `master`, or run **Deploy GitHub Pages** from the Actions tab.
5. Wait for the deployment job to complete.

The default URL will be:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

Vite uses relative asset paths, so the build works under both a repository subpath and a custom domain.

## Custom domain

Create `frontend/public/CNAME` containing only the hostname:

```text
meterdown.example
```

For a subdomain such as `www.meterdown.example`, configure:

```text
Type:  CNAME
Name:  www
Value: YOUR-USERNAME.github.io
```

For an apex domain such as `meterdown.example`, use GitHub Pages' `A` records:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Then enter the same hostname under **Settings > Pages > Custom domain**. Once DNS is verified, enable **Enforce HTTPS**.

Commit `frontend/public/CNAME` so Vite copies it into every production build. Otherwise a later deployment can remove the domain association.

## Other static hosts

Cloudflare Pages, Netlify, and Vercel can deploy the same frontend with:

```text
Root directory:    frontend
Build command:     npm run build
Publish directory: dist
```

No environment variables are currently required.

## Radio Kolkata

Radio Kolkata uses the YouTube IFrame Player API to control an embeddable recording from the page's custom player interface. No audio file is bundled with the repository.

The playlist is defined in `frontend/src/app.js`:

```js
const tracks = [
  {
    videoId: 'YOUTUBE_VIDEO_ID',
    title: 'Song title',
    artist: 'Artist name',
  },
];
```

Add another object to this array to add a song. The previous and next controls wrap around the playlist, playback advances automatically when a track ends, and the visible title and artist update without reloading the page. Each YouTube upload must allow playback on third-party websites.

This means:

- playback requires an internet connection;
- availability depends on YouTube and the video owner;
- browser privacy or content-blocking settings may prevent playback;
- the source can become unavailable or disallow embedding later.

For a durable public release, replace this integration with an audio file for which the project has streaming and public-performance rights.

## Archive status

The repository retains an earlier FastAPI and SQLite archive prototype under `backend/`. It includes cab records, memories, submissions, uploads, and local moderation endpoints, but none of those features are loaded by the current frontend.

Before restoring the archive publicly:

- replace fictional seed records with sourced material;
- move SQLite data to a managed production database;
- move uploaded media to object storage;
- add authentication and authorization to moderation routes;
- document provenance and consent for every public record.

## Media and rights

The hero animation is approximately 14 MB and is committed with the frontend assets. It is below GitHub's per-file limit, but a CDN or object-storage origin may improve delivery for a larger audience.

Before a public or commercial launch, confirm distribution rights for the artwork, animation, music, photographs, oral histories, and other archival material.

## Design rule

> You are stationary inside the memory; Kolkata moves outside.