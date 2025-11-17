from fastapi.testclient import TestClient
from types import SimpleNamespace

from app.main import app


client = TestClient(app)


def test_docling_extract_includes_images(monkeypatch):
    from app.api import routes_docling

    fake_meta = SimpleNamespace(
        markdown="# Title\n\ntext",
        images=[
            SimpleNamespace(
                filename="fig1.png",
                data_base64="iVBORw0KGgo=",
                media_type="image/png",
                page=1,
            )
        ],
    )

    def fake_extract_from_bytes(self, data: bytes):  # type: ignore
        return fake_meta

    monkeypatch.setattr(
        routes_docling._service.__class__,
        "extract_from_bytes",
        fake_extract_from_bytes,
    )

    resp = client.post(
        "/docling/extract",
        files={"file": ("sample.pdf", b"%PDF-1.4 fake", "application/pdf")},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body.get("markdown", "").startswith("# Title")
    assert isinstance(body.get("images"), list)
    assert body["images"][0]["filename"] == "fig1.png"
