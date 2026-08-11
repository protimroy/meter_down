from fastapi.testclient import TestClient

from backend.main import app


def test_health_and_archive():
    with TestClient(app) as client:
        assert client.get("/api/health").json()["status"] == "ok"
        cabs = client.get("/api/cabs").json()
        assert len(cabs) >= 6
        detail = client.get(f"/api/cabs/{cabs[0]['id']}").json()
        assert "memories" in detail
