import type { SourceChunk } from "./types";

export function annotateWithCitations(
  text: string,
  sources: SourceChunk[]
): string {
  if (!sources || sources.length === 0) return text;

  // Simple citation annotation - replace [citation_number] with clickable spans
  let annotated = text;
  
  sources.forEach((source) => {
    if (source.citation_number) {
      const citationPattern = new RegExp(
        `\\[${source.citation_number}\\]`,
        "g"
      );
      annotated = annotated.replace(
        citationPattern,
        `<span class="citation" data-citation="${source.citation_number}">[${source.citation_number}]</span>`
      );
    }
  });

  return annotated;
}

