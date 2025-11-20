import argparse
import base64
import os
import sys
import webbrowser
from datetime import datetime
from pathlib import Path

import requests
from app.services.docling_service import DoclingService


def write_gallery(out_dir: Path, images):
    out_dir.mkdir(parents=True, exist_ok=True)
    # Save each image and build simple HTML grid
    img_entries = []
    for i, img in enumerate(images):
        # Determine filename and extension
        fname = img.filename or f"image_{i}.png"
        # Sanitize filename just in case
        safe_name = "".join(c for c in fname if c.isalnum() or c in (".", "_", "-"))
        if not safe_name.lower().endswith((".png", ".jpg", ".jpeg", ".gif")):
            safe_name += ".png"

        img_path = out_dir / safe_name
        try:
            data = base64.b64decode(img.data_base64)
            with open(img_path, "wb") as f:
                f.write(data)
            img_entries.append((safe_name, img.page, img.media_type))
        except Exception as e:
            print(f"Failed to write {safe_name}: {e}")

    html = [
        "<!doctype html>",
        "<html><head><meta charset='utf-8'><title>Extracted Images</title>",
        "<style>body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial} .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;padding:16px} figure{margin:0;padding:8px;border:1px solid #ddd;border-radius:8px;background:#fafafa} figcaption{font-size:12px;color:#555;margin-top:6px;word-break:break-word} img{max-width:100%;height:auto;display:block;border-radius:4px}</style>",
        "</head><body>",
        f"<h2 style='padding:16px;margin:0'>Extracted Images ({len(img_entries)})</h2>",
        "<div class='grid'>",
    ]
    for name, page, media_type in img_entries:
        cap = f"{name} (page {page})" if page else name
        html.append(
            f"<figure><img src='{name}' alt='{cap}'/><figcaption>{cap} — {media_type or ''}</figcaption></figure>"
        )
    html += ["</div>", "</body></html>"]

    index_path = out_dir / "index.html"
    index_path.write_text("\n".join(html), encoding="utf-8")
    return index_path


def main():
    parser = argparse.ArgumentParser(description="Extract images from a PDF and optionally preview them.")
    parser.add_argument("--url", default="https://arxiv.org/pdf/2401.00001.pdf", help="PDF URL to download")
    parser.add_argument("--show", action="store_true", help="Save images and open an HTML gallery in the browser")
    parser.add_argument("--out-dir", default=None, help="Directory to save images and gallery (defaults to ./extracted_images/<timestamp>)")
    parser.add_argument("--open-explorer", action="store_true", help="Open the output directory in File Explorer on Windows")
    args = parser.parse_args()

    print(f"Downloading PDF from {args.url}...")
    r = requests.get(args.url, timeout=60)
    r.raise_for_status()

    svc = DoclingService()
    print("Extracting...")
    meta = svc.extract_from_bytes(r.content)
    count = 0 if not meta.images else len(meta.images)
    print("Images:", count)
    if meta.images:
        print("First image base64 length:", len(meta.images[0].data_base64))

    if args.show:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_out = Path(args.out_dir) if args.out_dir else Path.cwd() / "extracted_images" / ts
        index_html = write_gallery(base_out, meta.images or [])
        print(f"Saved {count} image(s) to: {base_out}")
        print(f"Opening gallery: {index_html}")
        try:
            webbrowser.open(index_html.as_uri())
        except Exception as e:
            print(f"Failed to open browser: {e}")
        # Optionally open File Explorer on Windows
        if args.open_explorer and os.name == "nt":
            try:
                os.startfile(str(base_out))  # type: ignore[attr-defined]
            except Exception as e:
                print(f"Failed to open Explorer: {e}")


if __name__ == "__main__":
    main()
