from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_search_openalex_smoke(monkeypatch):
    # avoid network by monkeypatching httpx.AsyncClient.get

    import httpx

    async def fake_get(self, url, params=None, **kwargs):  # type: ignore
        class Resp:
            status_code = 200

            def json(self):
                return {"results": [], "meta": {"count": 0}}

            text = "{}"

        return Resp()

    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)
    resp = client.get("/openalex/search", params={"q": "test"})
    assert resp.status_code == 200
    body = resp.json()
    assert "results" in body


def test_get_work_smoke(monkeypatch):
    import httpx

    async def fake_get(self, url, **kwargs):  # type: ignore
        class Resp:
            status_code = 200

            def json(self):
                return {"id": "https://openalex.org/W123"}

            text = "{}"

        return Resp()

    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)
    resp = client.get("/openalex/works/W123")
    assert resp.status_code == 200
    assert resp.json()["id"].endswith("W123")


def test_extract_pdf_arxiv_success(monkeypatch):
    import httpx
    from types import SimpleNamespace
    from app.services.docling_service import DoclingService

    # OpenAlex work with arXiv location and minimal metadata
    work = {
        "id": "https://openalex.org/W4312894406",
        "title": "BEVFormer: Learning Bird’s-Eye-View Representation...",
        "authorships": [
            {"author": {"display_name": "Zhiqi Li"}},
            {"author": {"display_name": "Wenhai Wang"}},
        ],
        "abstract_inverted_index": {"This": [0], "is": [1], "abstract": [2]},
        "biblio": {"first_page": "1", "last_page": "18"},
        "locations": [
            {
                "pdf_url": "https://arxiv.org/pdf/2203.17270",
                "landing_page_url": "https://arxiv.org/abs/2203.17270",
                "source": {"id": "https://openalex.org/S4306400194"},
            }
        ],
        "open_access": {"oa_url": "https://arxiv.org/pdf/2203.17270"},
    }

    async def fake_get(self, url, **kwargs):  # type: ignore
        class Resp:
            status_code = 200

            def json(self):
                return work

            text = "{}"

        return Resp()

    def fake_extract(self, url: str):
        # Ensure .pdf normalization occurred
        assert url.endswith(".pdf")
        return SimpleNamespace(markdown="# Extracted Markdown\n\n...")

    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)
    monkeypatch.setattr(DoclingService, "extract_from_url", fake_extract)

    resp = client.get("/openalex/extract/W4312894406")
    assert resp.status_code == 200
    data = resp.json()
    assert "markdown" in data and data["markdown"].startswith("# Extracted")
    assert data["source_url"].endswith(".pdf")


def test_extract_pdf_no_arxiv_404(monkeypatch):
    import httpx
    from app.services.docling_service import DoclingService

    work = {
        "id": "https://openalex.org/W000",
        "display_name": "Closed Access Example",
        "authorships": [],
        "biblio": {},
        "locations": [
            {
                "landing_page_url": "https://doi.org/10.1000/xyz123",
                "source": {"id": "https://openalex.org/S123456"},
            }
        ],
        "open_access": {"oa_url": None},
    }

    async def fake_get(self, url, **kwargs):  # type: ignore
        class Resp:
            status_code = 200

            def json(self):
                return work

            text = "{}"

        return Resp()

    def bad_extract(self, url: str):
        raise AssertionError("Docling should not be invoked when no arXiv URL exists")

    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)
    monkeypatch.setattr(DoclingService, "extract_from_url", bad_extract)

    resp = client.get("/openalex/extract/W000")
    assert resp.status_code == 404
