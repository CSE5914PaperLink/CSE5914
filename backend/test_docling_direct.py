"""Direct test of Docling image extraction to understand the API"""
import requests
from docling.document_converter import DocumentConverter
import tempfile
import os

# Download the PDF
arxiv_id = "2401.00001"
url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
print(f"Downloading {url}...")
response = requests.get(url)
pdf_bytes = response.content

with tempfile.TemporaryDirectory() as td:
    tmp_path = os.path.join(td, "test.pdf")
    with open(tmp_path, "wb") as f:
        f.write(pdf_bytes)
    
    print(f"Converting PDF...")
    converter = DocumentConverter()
    result = converter.convert(tmp_path)
    
    doc = result.document
    
    print(f"\n=== Result Pages ===")
    if hasattr(result, 'pages'):
        print(f"Pages type: {type(result.pages)}")
        if isinstance(result.pages, list):
            print(f"Pages length: {len(result.pages)}")
            if result.pages:
                first_page = result.pages[0]
                print(f"\nFirst page type: {type(first_page)}")
                print(f"First page attributes:")
                for attr in [a for a in dir(first_page) if not a.startswith('_')]:
                    val = getattr(first_page, attr, None)
                    if not callable(val):
                        print(f"  {attr}: {type(val)}")
                
                print(f"\nChecking for image data:")
                for attr in ['image', 'pil_image', 'rendered_image', 'bitmap']:
                    if hasattr(first_page, attr):
                        val = getattr(first_page, attr)
                        print(f"  {attr}: type={type(val)}, exists={val is not None}")
                        if val is not None:
                            print(f"    Size: {val.size if hasattr(val, 'size') else 'N/A'}")
    
    print(f"\n=== Pictures ===")
    if hasattr(doc, 'pictures') and doc.pictures:
        print(f"Number of pictures: {len(doc.pictures)}")
        pic = doc.pictures[0]
        print(f"\nFirst picture:")
        if hasattr(pic, 'prov') and pic.prov:
            prov = pic.prov[0]
            print(f"  Page: {prov.page_no if hasattr(prov, 'page_no') else 'unknown'}")
            print(f"  Bbox: {prov.bbox if hasattr(prov, 'bbox') else 'unknown'}")
