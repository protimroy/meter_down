from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "meter_down.db"


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    with connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS cabs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                registration TEXT UNIQUE NOT NULL,
                nickname TEXT,
                model_year INTEGER,
                variant TEXT NOT NULL DEFAULT 'Hindustan Ambassador',
                fuel TEXT,
                first_seen_year INTEGER,
                last_seen_year INTEGER,
                status TEXT NOT NULL,
                status_date TEXT,
                driver_name TEXT,
                driver_languages TEXT,
                taxi_stand TEXT,
                neighbourhood TEXT,
                story TEXT,
                quote TEXT,
                odometer_km INTEGER,
                color_note TEXT,
                photo_url TEXT,
                lat REAL,
                lng REAL,
                verified INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cab_id INTEGER NOT NULL,
                author_name TEXT NOT NULL,
                memory TEXT NOT NULL,
                year INTEGER,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(cab_id) REFERENCES cabs(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                registration TEXT,
                submitter_name TEXT,
                email TEXT,
                driver_name TEXT,
                approximate_year TEXT,
                usual_location TEXT,
                status TEXT,
                memory TEXT,
                photo_path TEXT,
                consent INTEGER NOT NULL DEFAULT 0,
                moderation_status TEXT NOT NULL DEFAULT 'PENDING',
                processed_at TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )

        submission_cols = {row["name"] for row in conn.execute("PRAGMA table_info(submissions)").fetchall()}
        if "moderation_status" not in submission_cols:
            conn.execute("ALTER TABLE submissions ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'PENDING'")
        if "processed_at" not in submission_cols:
            conn.execute("ALTER TABLE submissions ADD COLUMN processed_at TEXT")

        count = conn.execute("SELECT COUNT(*) AS n FROM cabs").fetchone()["n"]
        if count == 0:
            seed(conn)


def seed(conn: sqlite3.Connection) -> None:
    # Fictional demonstration records. The UI clearly labels them as prototype records.
    cabs: list[dict[str, Any]] = [
        {
            "registration": "WB 04 F 3734",
            "nickname": "Buro Holud",
            "model_year": 2008,
            "fuel": "Diesel",
            "first_seen_year": 2011,
            "last_seen_year": 2024,
            "status": "RETIRED",
            "status_date": "December 2024",
            "driver_name": "Mohammad Salim",
            "driver_languages": json.dumps(["Bangla", "Hindi"]),
            "taxi_stand": "Esplanade",
            "neighbourhood": "Dharmatala",
            "story": "A long-shift city cab in this prototype archive: station runs before sunrise, office traffic at nine, and late-night rides home after the last Metro crowd thinned.",
            "quote": "You learned the city by listening to where people needed to go.",
            "odometer_km": 612430,
            "color_note": "Sun-faded taxi yellow, hand-painted blue belt line",
            "lat": 22.5645,
            "lng": 88.3510,
        },
        {
            "registration": "WB 04 D 9812",
            "nickname": "Monsoon No. 12",
            "model_year": 2006,
            "fuel": "Diesel",
            "first_seen_year": 2008,
            "last_seen_year": 2021,
            "status": "SCRAPPED",
            "status_date": "August 2021",
            "driver_name": "Ratan Mondal",
            "driver_languages": json.dumps(["Bangla"]),
            "taxi_stand": "Gariahat",
            "neighbourhood": "Ballygunge",
            "story": "Known in the prototype for a dashboard crowded with old receipts, a cracked meter hood, and a driver who preferred Rashbehari Avenue even when passengers insisted on shortcuts.",
            "quote": "In the rain, every Ambassador sounded different.",
            "odometer_km": 704220,
            "color_note": "Deep yellow with rain-stained chrome",
            "lat": 22.5194,
            "lng": 88.3659,
        },
        {
            "registration": "WB 04 B 1843",
            "nickname": "Howrah Runner",
            "model_year": 1999,
            "fuel": "Diesel",
            "first_seen_year": 2001,
            "last_seen_year": 2014,
            "status": "WHEREABOUTS UNKNOWN",
            "status_date": "Last documented 2014",
            "driver_name": "Unknown",
            "driver_languages": json.dumps([]),
            "taxi_stand": "Howrah Station",
            "neighbourhood": "Howrah",
            "story": "A deliberately incomplete record: one plate, one remembered location, and no confirmed ending. This is the kind of cab the public archive is meant to recover.",
            "quote": "Have you seen this taxi?",
            "odometer_km": None,
            "color_note": "Older mustard-yellow finish",
            "lat": 22.5839,
            "lng": 88.3420,
        },
        {
            "registration": "WB 04 H 2207",
            "nickname": "College Street Cab",
            "model_year": 2010,
            "fuel": "Diesel",
            "first_seen_year": 2012,
            "last_seen_year": 2026,
            "status": "ON THE ROAD",
            "status_date": "Seen July 2026",
            "driver_name": "Subhash Dey",
            "driver_languages": json.dumps(["Bangla", "Hindi", "English"]),
            "taxi_stand": "College Street",
            "neighbourhood": "Boi Para",
            "story": "Still moving through the prototype city. Booksellers know the car; students recognize the loose passenger-side handle and the little red cloth tied near the rear-view mirror.",
            "quote": "The city changes. The routes stay in your hands.",
            "odometer_km": 488010,
            "color_note": "Bright yellow, recently touched-up doors",
            "lat": 22.5754,
            "lng": 88.3639,
        },
        {
            "registration": "WB 04 E 5519",
            "nickname": "New Market Evening",
            "model_year": 2007,
            "fuel": "Diesel",
            "first_seen_year": 2010,
            "last_seen_year": 2023,
            "status": "RESTORED",
            "status_date": "Private restoration, 2025",
            "driver_name": "Anil Shaw",
            "driver_languages": json.dumps(["Hindi", "Bangla"]),
            "taxi_stand": "New Market",
            "neighbourhood": "Lindsay Street",
            "story": "Retired from commercial service, then preserved. Its prototype record includes the original meter housing, seat vinyl and several layers of hand-painted lettering discovered during restoration.",
            "quote": "Do not make it new. Keep the years on it.",
            "odometer_km": 530905,
            "color_note": "Restored yellow with original patina retained",
            "lat": 22.5595,
            "lng": 88.3536,
        },
        {
            "registration": "WB 04 G 7621",
            "nickname": "Tramline Taxi",
            "model_year": 2009,
            "fuel": "Diesel",
            "first_seen_year": 2011,
            "last_seen_year": 2025,
            "status": "RETIRED",
            "status_date": "March 2025",
            "driver_name": "Pradip Naskar",
            "driver_languages": json.dumps(["Bangla"]),
            "taxi_stand": "Shyambazar",
            "neighbourhood": "North Kolkata",
            "story": "Its remembered territory was the old north: narrow lanes, tram tracks, market traffic and long waits beneath the five-point crossing.",
            "quote": "A taxi stand is a little neighbourhood of its own.",
            "odometer_km": 641221,
            "color_note": "Matte yellow, darkened roof gutters",
            "lat": 22.6010,
            "lng": 88.3732,
        },
    ]

    for cab in cabs:
        cols = ", ".join(cab.keys())
        placeholders = ", ".join(["?"] * len(cab))
        conn.execute(
            f"INSERT INTO cabs ({cols}) VALUES ({placeholders})",
            tuple(cab.values()),
        )

    memories = [
        (1, "M.", "I remember the heavy door closing before a dawn ride toward Howrah. The city was almost silent.", 2018),
        (1, "Ria", "The meter clicked louder than the radio. That sound is what I remember first.", 2016),
        (2, "Anonymous", "We always found a yellow cab here after tuition during monsoon season.", 2013),
        (4, "Soham", "Saw this plate near College Street last summer and photographed it from the pavement.", 2025),
        (5, "Amit", "The restoration kept the old seat covers. That mattered more than making the paint perfect.", 2025),
    ]
    conn.executemany(
        "INSERT INTO memories (cab_id, author_name, memory, year) VALUES (?, ?, ?, ?)",
        memories,
    )
    conn.commit()


def row_to_cab(row: sqlite3.Row, conn: sqlite3.Connection | None = None) -> dict[str, Any]:
    cab = dict(row)
    try:
        cab["driver_languages"] = json.loads(cab.get("driver_languages") or "[]")
    except json.JSONDecodeError:
        cab["driver_languages"] = []
    cab["verified"] = bool(cab.get("verified"))
    if conn is not None:
        memories = conn.execute(
            "SELECT * FROM memories WHERE cab_id = ? ORDER BY created_at DESC, id DESC",
            (cab["id"],),
        ).fetchall()
        cab["memories"] = [dict(m) for m in memories]
    return cab
