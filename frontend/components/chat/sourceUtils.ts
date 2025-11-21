import { SourceChunk } from "./types";

const DEFAULT_TITLE = "Untitled";

const normalizeSnippet = (value: string | undefined) =>
  value ? value.replace(/\s+/g, " ").trim().toLowerCase() : "";

const buildKey = (source: SourceChunk, index: number) => {
  const doc = source.doc_id ?? source.title ?? "unknown";
  const chunk = source.chunk_index ?? `idx${index}`;
  const page = source.page ?? "p0";
  const snippet =
    normalizeSnippet(
      source.content || source.caption || source.heading || source.filename
    ) || `idx${index}`;

  return `${source.type}|${doc}|${chunk}|${page}|${snippet}`;
};

export const dedupeSources = (sources: SourceChunk[]): SourceChunk[] => {
  const seen = new Set<string>();
  const result: SourceChunk[] = [];
  sources.forEach((source, index) => {
    const key = buildKey(source, index);
    if (seen.has(key)) return;
    seen.add(key);
    result.push(source);
  });
  return result;
};

export const truncateTitle = (title?: string, maxLength = 15): string => {
  const base = (title && title.trim()) || DEFAULT_TITLE;
  if (base.length <= maxLength) return base;
  return `${base.slice(0, maxLength - 1)}…`;
};
