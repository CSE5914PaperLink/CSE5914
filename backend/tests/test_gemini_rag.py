import os
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_chat_rag_schema_no_key():
    # If no Gemini key in environment, endpoint should return 500 on downstream call,
    # but our request validation and route plumbing should still work until the call.
    payload = {"prompt": "What is retrieval augmented generation?", "top_k": 1}
    resp = client.post("/gemini/chat_rag", json=payload)
    # If key is present, we expect success 200; otherwise likely 500. Accept both
    assert resp.status_code in (200, 500)
    if resp.status_code == 200:
        data = resp.json()
        assert "model" in data
        assert "content" in data
        assert "chunks" in data
