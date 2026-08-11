from __future__ import annotations

import shutil
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .db import connect, init_db, row_to_cab

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Meter Down Archive API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


class MemoryIn(BaseModel):
    author_name: str = Field(min_length=1, max_length=80)
    memory: str = Field(min_length=3, max_length=1200)
    year: int | None = Field(default=None, ge=1900, le=2100)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/stats")
def stats() -> dict[str, int]:
    with connect() as conn:
        total = conn.execute("SELECT COUNT(*) n FROM cabs").fetchone()["n"]
        on_road = conn.execute("SELECT COUNT(*) n FROM cabs WHERE status = 'ON THE ROAD'").fetchone()["n"]
        memories = conn.execute("SELECT COUNT(*) n FROM memories").fetchone()["n"]
        unknown = conn.execute("SELECT COUNT(*) n FROM cabs WHERE status = 'WHEREABOUTS UNKNOWN'").fetchone()["n"]
    return {"cabs": total, "on_road": on_road, "memories": memories, "unknown": unknown}


@app.get("/api/cabs")
def list_cabs(status: str | None = None, q: str | None = None) -> list[dict]:
    sql = "SELECT * FROM cabs WHERE 1=1"
    args: list[str] = []
    if status:
        sql += " AND status = ?"
        args.append(status)
    if q:
        sql += " AND (registration LIKE ? OR nickname LIKE ? OR driver_name LIKE ? OR neighbourhood LIKE ?)"
        term = f"%{q}%"
        args.extend([term, term, term, term])
    sql += " ORDER BY CASE status WHEN 'ON THE ROAD' THEN 0 WHEN 'WHEREABOUTS UNKNOWN' THEN 1 ELSE 2 END, last_seen_year DESC"
    with connect() as conn:
        rows = conn.execute(sql, args).fetchall()
        return [row_to_cab(row) for row in rows]


@app.get("/api/cabs/random")
def random_cab() -> dict:
    with connect() as conn:
        row = conn.execute("SELECT * FROM cabs ORDER BY RANDOM() LIMIT 1").fetchone()
        if not row:
            raise HTTPException(404, "No cabs in archive")
        return row_to_cab(row, conn)


@app.get("/api/cabs/{cab_id}")
def get_cab(cab_id: int) -> dict:
    with connect() as conn:
        row = conn.execute("SELECT * FROM cabs WHERE id = ?", (cab_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Cab not found")
        return row_to_cab(row, conn)


@app.post("/api/cabs/{cab_id}/memories", status_code=201)
def add_memory(cab_id: int, body: MemoryIn) -> dict:
    with connect() as conn:
        exists = conn.execute("SELECT 1 FROM cabs WHERE id = ?", (cab_id,)).fetchone()
        if not exists:
            raise HTTPException(404, "Cab not found")
        cursor = conn.execute(
            "INSERT INTO memories (cab_id, author_name, memory, year) VALUES (?, ?, ?, ?)",
            (cab_id, body.author_name.strip(), body.memory.strip(), body.year),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM memories WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return dict(row)


@app.post("/api/submissions", status_code=201)
def create_submission(
    registration: Annotated[str | None, Form()] = None,
    submitter_name: Annotated[str | None, Form()] = None,
    email: Annotated[str | None, Form()] = None,
    driver_name: Annotated[str | None, Form()] = None,
    approximate_year: Annotated[str | None, Form()] = None,
    usual_location: Annotated[str | None, Form()] = None,
    status: Annotated[str | None, Form()] = None,
    memory: Annotated[str | None, Form()] = None,
    consent: Annotated[bool, Form()] = False,
    photo: Annotated[UploadFile | None, File()] = None,
) -> dict:
    if not any([registration, driver_name, usual_location, memory, photo]):
        raise HTTPException(400, "Please provide at least one identifying detail, memory, or photo")

    photo_path: str | None = None
    if photo and photo.filename:
        suffix = Path(photo.filename).suffix.lower()
        if suffix not in {".jpg", ".jpeg", ".png", ".webp"}:
            raise HTTPException(400, "Photo must be JPG, PNG, or WebP")
        filename = f"{uuid.uuid4().hex}{suffix}"
        destination = UPLOAD_DIR / filename
        with destination.open("wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        photo_path = f"/uploads/{filename}"

    with connect() as conn:
        cursor = conn.execute(
            """
            INSERT INTO submissions
            (registration, submitter_name, email, driver_name, approximate_year, usual_location, status, memory, photo_path, consent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                registration,
                submitter_name,
                email,
                driver_name,
                approximate_year,
                usual_location,
                status,
                memory,
                photo_path,
                int(consent),
            ),
        )
        conn.commit()
    return {"id": cursor.lastrowid, "received": True, "photo_path": photo_path}


@app.get("/api/admin/submissions")
def list_submissions() -> list[dict]:
    """Local prototype moderation queue. Add authentication before public deployment."""
    with connect() as conn:
        rows = conn.execute(
            "SELECT * FROM submissions ORDER BY CASE moderation_status WHEN 'PENDING' THEN 0 ELSE 1 END, created_at DESC"
        ).fetchall()
        return [dict(row) for row in rows]


@app.post("/api/admin/submissions/{submission_id}/approve")
def approve_submission(submission_id: int) -> dict:
    with connect() as conn:
        sub = conn.execute("SELECT * FROM submissions WHERE id = ?", (submission_id,)).fetchone()
        if not sub:
            raise HTTPException(404, "Submission not found")
        if sub["moderation_status"] != "PENDING":
            raise HTTPException(409, f"Submission is already {sub['moderation_status'].lower()}")

        registration = (sub["registration"] or "").strip() or f"UNIDENTIFIED #{submission_id:04d}"
        existing = conn.execute("SELECT id FROM cabs WHERE registration = ?", (registration,)).fetchone()
        if existing:
            raise HTTPException(409, "A cab with this registration already exists")

        year = None
        if sub["approximate_year"]:
            import re
            match = re.search(r"(?:19|20)\d{2}", sub["approximate_year"])
            if match:
                year = int(match.group(0))

        cursor = conn.execute(
            """
            INSERT INTO cabs
            (registration, nickname, model_year, fuel, first_seen_year, last_seen_year, status, status_date,
             driver_name, neighbourhood, story, quote, photo_url, verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
            """,
            (
                registration,
                "Community field note",
                year,
                "Unknown",
                year,
                year,
                sub["status"] or "WHEREABOUTS UNKNOWN",
                "Community submission — verification pending",
                sub["driver_name"] or "Unknown",
                sub["usual_location"] or "Kolkata",
                sub["memory"] or "Community-submitted record awaiting further documentation.",
                "This record began as a community field note.",
                sub["photo_path"],
            ),
        )
        conn.execute(
            "UPDATE submissions SET moderation_status = 'APPROVED', processed_at = CURRENT_TIMESTAMP WHERE id = ?",
            (submission_id,),
        )
        if sub["memory"]:
            conn.execute(
                "INSERT INTO memories (cab_id, author_name, memory) VALUES (?, ?, ?)",
                (cursor.lastrowid, sub["submitter_name"] or "Anonymous contributor", sub["memory"]),
            )
        conn.commit()
        return {"approved": True, "cab_id": cursor.lastrowid, "registration": registration}


@app.post("/api/admin/submissions/{submission_id}/reject")
def reject_submission(submission_id: int) -> dict:
    with connect() as conn:
        sub = conn.execute("SELECT * FROM submissions WHERE id = ?", (submission_id,)).fetchone()
        if not sub:
            raise HTTPException(404, "Submission not found")
        if sub["moderation_status"] != "PENDING":
            raise HTTPException(409, f"Submission is already {sub['moderation_status'].lower()}")
        conn.execute(
            "UPDATE submissions SET moderation_status = 'REJECTED', processed_at = CURRENT_TIMESTAMP WHERE id = ?",
            (submission_id,),
        )
        conn.commit()
        return {"rejected": True}

STATIC_DIR = BASE_DIR / "static"
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

@app.get("/", include_in_schema=False)
def index():
    from fastapi.responses import FileResponse
    return FileResponse(STATIC_DIR / "index.html")
