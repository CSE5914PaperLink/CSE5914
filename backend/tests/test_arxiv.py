from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_arxiv_search_smoke(monkeypatch):
    import httpx

    async def fake_get(self, url, params=None, **kwargs):  # type: ignore
        class Resp:
            status_code = 200
            text = "<feed></feed>"

        return Resp()

    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)
    resp = client.get("/arxiv/search", params={"q": "transformers"})
    assert resp.status_code == 200
    body = resp.json()
    assert "atom" in body


def test_arxiv_download_smoke(monkeypatch):
    import httpx

    async def fake_get(self, url, **kwargs):  # type: ignore
        class Resp:
            status_code = 200
            headers = {"content-type": "application/pdf"}
            content = b"%PDF-1.4 fake"

        return Resp()

    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)
    resp = client.get("/arxiv/download/2101.00001")
    assert resp.status_code == 200
    assert resp.headers.get("content-type", "").startswith("application/pdf")
