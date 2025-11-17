#!/usr/bin/env python3
"""Test multimodal RAG with images in context."""

import requests
import json

BASE_URL = "http://localhost:8000"


def test_multimodal_rag():
    """Test RAG retrieval with images."""

    # Query that should retrieve images
    response = requests.post(
        f"{BASE_URL}/gemini/chat_rag",
        json={
            "prompt": "Tell me about docking's architecture",
            "doc_ids": ["2203.17270v2"],
            "top_k": 5,
            "temperature": 0.2,
        },
    )

    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print(f"\nModel: {data['model']}")
        print(f"Top K: {data['top_k']}")
        print(f"Text chunks: {len(data.get('chunks', []))}")
        print(f"Image chunks: {len(data.get('images', []))}")

        print("\n=== Retrieved Images ===")
        for img in data.get("images", []):
            print(f"  - {img['filename']} (page {img['page']}, bbox={img.get('bbox')})")

        print("\n=== Response ===")
        print(
            data["content"][:500] + "..."
            if len(data["content"]) > 500
            else data["content"]
        )
    else:
        print(f"Error: {response.text}")


if __name__ == "__main__":
    test_multimodal_rag()
