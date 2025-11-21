import type { SourceChunk } from "./types";

export function dedupeSources(sources: SourceChunk[]): SourceChunk[] {
  const seen = new Set<string>();
  const result: SourceChunk[] = [];

  for (const source of sources) {
    const key = `${source.doc_id}-${source.page}-${source.chunk_index || source.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(source);
    }
  }

  return result;
}

