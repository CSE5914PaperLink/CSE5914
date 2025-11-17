import requests
from app.services.docling_service import DoclingService

url = "https://arxiv.org/pdf/2401.00001.pdf"
print("Downloading PDF...")
r = requests.get(url, timeout=60)
r.raise_for_status()

svc = DoclingService()
print("Extracting...")
meta = svc.extract_from_bytes(r.content)
print("Images:", 0 if meta.images is None else len(meta.images))
if meta.images:
    print("First image bytes:", len(meta.images[0].data_base64))
