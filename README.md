# Meter Down — Immersive Local Build

**An animated field archive for Kolkata's disappearing yellow Ambassador taxis.**

This version is deliberately art-first. The approved painterly back-seat scene is the public interface; the archive, cab records, passenger memories, contribution form, and moderation desk sit underneath it as secondary layers.

## Static preview deployment

The current public build disables the archive, submissions, cab navigation, and database startup dependency. It can be deployed as a static site without FastAPI or SQLite.

Build it with:

```bash
cd frontend
npm install
npm run build
```

Deploy `frontend/dist/` as the publish directory. Common host settings are:

```text
Root directory: frontend
Build command: npm run build
Publish directory: dist
```

These settings work with Cloudflare Pages, Netlify, Vercel, and similar static hosts. The generated bundle uses relative asset paths and makes no archive API requests.

## Run it locally

From the project root:

```bash
./run_local.sh
```

or:

```bash
uv sync
uv run uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Then open:

```text
http://127.0.0.1:8000
```

The primary version is prebuilt and served directly by FastAPI, so **Node is not required just to try the site**.

## What to try first

1. Click **START THE METER**.
2. Move the pointer slowly: the illustrated scene has restrained parallax.
3. Click the player controls painted into the artwork.
4. Press **R** or click **MONSOON** to bring in rain, wipers, darker grading, and rain audio.
5. Press **H** or click the steering-wheel hotspot for the Ambassador horn.
6. Click the illustrated taxi meter or the neighboring cab's registration plate to open the current cab record.
7. Click the archive count in the upper-left to open **THE REGISTER**.
8. Add a passenger memory to a cab.
9. Use **ADD A TAXI** to create a field note.
10. Open **ABOUT → FIELD DESK**, approve that field note, then return to the register. It becomes an unverified archive record.

Keyboard shortcuts when no drawer is open:

```text
SPACE   start / stop engine
← →     previous / next cab
R       rain
H       horn
A       archive
ESC     close archive / record / form
```

## Public experience

The landing experience has no conventional navbar. The illustration carries the interaction:

- **archive count** → register
- **ABOUT** → project statement
- **taxi meter** → current cab record
- **registration plate** → current cab record
- **steering wheel / driver area** → horn
- **windscreen area** → monsoon mode
- **RADIO CALCUTTA** → procedural radio static
- **painted player controls** → previous / engine / next / random cab
- **painted volume slider** → master Web Audio volume

The live taxi fare is an HTML overlay positioned on the illustrated meter and increments while the engine is running.

## Animation system

The image remains the visual master. Motion is intentionally small enough to preserve the feeling of an animated painting rather than a game scene.

Implemented effects:

- pointer-driven 2.5D camera drift
- diesel-idle micro vibration
- atmospheric haze
- moving distant light traces
- canvas rain
- synchronized CSS windshield wipers
- scene color grading per cab / ride
- dark monsoon treatment
- cab-change blackout transition
- film grain
- live meter fare
- `prefers-reduced-motion` fallback

## Sound system

No copyrighted audio is bundled. Sound is generated locally with the Web Audio API:

- low diesel idle
- mechanical meter click
- dual-tone horn
- taxi-door thump
- city-noise bed
- radio static
- rain noise

The generated artwork contains a period-song title as part of the illustration, but the prototype does not reproduce that recording.

## Archive system

FastAPI + SQLite provide the local archive:

```text
GET  /api/health
GET  /api/stats
GET  /api/cabs
GET  /api/cabs/random
GET  /api/cabs/{id}
POST /api/cabs/{id}/memories
POST /api/submissions
GET  /api/admin/submissions
POST /api/admin/submissions/{id}/approve
POST /api/admin/submissions/{id}/reject
GET  /docs
```

Local data is stored at:

```text
backend/meter_down.db
```

Uploaded contribution photographs go to:

```text
backend/uploads/
```

Delete `backend/meter_down.db` and restart to reset the six seeded demo records.

## Prototype-data warning

The seeded taxi registrations, drivers, histories, and passenger memories are **fictional demonstration records**. They exist only to exercise the interface and data model.

Do not present them as Kolkata history. A public launch should replace them with sourced field records and add provenance for every photograph, oral history, sighting, ownership claim, and status change.

## Artwork provenance warning

The bundled `howrah-ride.webp` is the approved prototype artwork generated in this project from the user-supplied visual reference. The supplied reference was a watermarked stock image.

Use this asset to evaluate the local experience. Before a public/commercial launch, create or commission a clean original scene from owned/licensed reference material in the same art direction and replace the prototype master.

## Optional editable Vite source

The canonical no-build files live in `backend/static/`.

A mirrored Vite source tree is included in `frontend/` for easier iteration:

```bash
# terminal 1
uv run uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000

# terminal 2
cd frontend
npm install
npm run dev
```

Vite proxies `/api` and `/uploads` to FastAPI on port 8000.

If you edit `frontend/src/`, build it and copy the output into `backend/static/` before deployment, or keep the two directories synchronized as this prototype does.

## Production direction

The current structure is deliberately local-first. For launch:

```text
Browser
  │
  ├── animated public scene
  ├── register / records / submissions
  │
FastAPI
  │
  ├── PostgreSQL       cab graph + memories + provenance
  ├── S3 / R2          original photographs + audio
  └── admin auth       Field Desk
```

Recommended model additions before launch:

- `people`
- `cab_people`
- `sightings`
- `media`
- `sources`
- `status_events`
- `moderation_events`
- `consent_records`
- `oral_histories`
- `translations`

The long-term object is not a gallery of yellow taxis. It is a **reconstructed historical graph of individual Kolkata cabs**: where they were seen, who drove them, who remembers them, what happened to them, and which evidence supports each claim.

## Design rule

> Do not explain the Ambassador before the visitor feels like they are sitting inside one.
