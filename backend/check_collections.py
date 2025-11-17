import chromadb

client = chromadb.PersistentClient(path='./chroma')
collections = client.list_collections()

print(f"Found {len(collections)} collections:")
for coll in collections:
    print(f"\n  {coll.name}:")
    data = coll.get(include=["metadatas"])  # Get ALL, no limit
    print(f"    Total chunks: {len(data['ids'])}")
    
    # Group by doc_id
    docs = {}
    for md in data.get('metadatas', []):
        doc_id = md.get('doc_id')
        if doc_id and doc_id not in docs:
            docs[doc_id] = md.get('arxiv_id')
    
    print(f"    Unique papers: {len(docs)}")
    for doc_id, arxiv_id in docs.items():
        print(f"      - {arxiv_id}")
