import { SourceChunk } from "./types";

const CITATION_GROUP_REGEX = /\[(\s*\d+(?:\s*,\s*\d+)*)\]/g;

const BRACKETED_SOURCE_REGEX =
  /\[\s*(?:image\s+)?source\s*#?(\d+)\s*\]/gi;
const PAREN_SOURCE_REGEX = /\(\s*(?:image\s+)?source\s*#?(\d+)\s*\)/gi;
const BARE_SOURCE_REGEX =
  /(^|[\s\[\(])((?:image\s+)?source\s*#?(\d+))/gi;

const TOKEN_REGEX = /\b[a-z0-9]{4,}\b/gi;

type ParagraphCitations = Record<number, number[]>;

const isAlphaNumeric = (value: string | undefined) =>
  !!value && /[a-z0-9]/i.test(value);

const tokenize = (value: string | undefined): string[] => {
  if (!value) return [];
  const matches = value.toLowerCase().match(TOKEN_REGEX);
  return matches ? matches : [];
};

const overlapScore = (a: Set<string>, b: Set<string>): number => {
  if (!a.size || !b.size) return 0;
  let score = 0;
  b.forEach((token) => {
    if (a.has(token)) score += 1;
  });
  return score;
};

const normalizeInlineMentions = (text: string): string => {
  let normalized = text.replace(
    BRACKETED_SOURCE_REGEX,
    (_, num: string) => `[${num}]`
  );
  normalized = normalized.replace(
    PAREN_SOURCE_REGEX,
    (_, num: string) => `[${num}]`
  );
  normalized = normalized.replace(
    BARE_SOURCE_REGEX,
    (match: string, prefix: string, full: string, num: string, offset, str) => {
      const startIndex = offset + prefix.length;
      const before = startIndex > 0 ? str[startIndex - 1] : "";
      const after = str[startIndex + full.length] || "";
      if (isAlphaNumeric(before) || isAlphaNumeric(after)) {
        return `${prefix}${full}`;
      }
      return `${prefix}[${num}]`;
    }
  );
  return normalized;
};

const appendCitation = (
  map: ParagraphCitations,
  idx: number,
  number: number
) => {
  if (!map[idx]) {
    map[idx] = [];
  }
  if (!map[idx].includes(number)) {
    map[idx].push(number);
  }
};

const rebuildTextWithCitations = (
  segments: string[],
  separators: string[],
  citations: ParagraphCitations
) => {
  let rebuilt = "";
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const trailingWhitespaceMatch = segment.match(/\s+$/);
    const trailingWhitespace = trailingWhitespaceMatch
      ? trailingWhitespaceMatch[0]
      : "";
    const baseLength = segment.length - trailingWhitespace.length;
    const baseText = baseLength >= 0 ? segment.slice(0, baseLength) : segment;
    const addition = citations[i]
      ? citations[i].map((num) => ` [${num}]`).join("")
      : "";
    rebuilt += baseText + addition + trailingWhitespace;
    if (i < separators.length) {
      rebuilt += separators[i];
    }
  }
  return rebuilt;
};

const getResolvedCitationNumber = (
  source: SourceChunk,
  fallbackIndex: number
) => source.citation_number ?? fallbackIndex + 1;

const extractCitationNumbers = (group: string): number[] => {
  return group
    .split(",")
    .map((segment) => parseInt(segment.trim(), 10))
    .filter((value) => Number.isFinite(value));
};

/**
 * Ensure the assistant message contains inline numeric citations that match
 * the retrieved source chunks that are shown beneath the response.
 */
export const annotateWithCitations = (
  text: string,
  sources?: SourceChunk[]
): string => {
  if (!sources?.length) {
    return text;
  }

  const normalized = normalizeInlineMentions(text);

  const existingNumbers = new Set<number>();
  let groupMatch: RegExpExecArray | null;
  const groupRegex = new RegExp(CITATION_GROUP_REGEX);
  while ((groupMatch = groupRegex.exec(normalized)) !== null) {
    const numbers = extractCitationNumbers(groupMatch[1]);
    numbers.forEach((value) => existingNumbers.add(value));
  }

  const segments = normalized.split(/\n{2,}/);
  if (segments.length === 0) {
    segments.push(normalized);
  }
  const separators = normalized.match(/\n{2,}/g) ?? [];

  const paragraphTokens = segments.map(
    (segment) => new Set(tokenize(segment))
  );

  const citationsPerParagraph: ParagraphCitations = {};
  const fallbackParagraphIndex = segments.length - 1;

  sources.forEach((source, idx) => {
    const citationNumber = getResolvedCitationNumber(source, idx);
    if (existingNumbers.has(citationNumber)) {
      return;
    }

    const sourceTokens = new Set(
      tokenize(source.content || source.caption || source.heading || source.title)
    );

    let destinationIdx = fallbackParagraphIndex;
    if (sourceTokens.size > 0) {
      let bestScore = 0;
      paragraphTokens.forEach((paragraphTokenSet, paragraphIdx) => {
        const score = overlapScore(paragraphTokenSet, sourceTokens);
        if (score > bestScore) {
          bestScore = score;
          destinationIdx = paragraphIdx;
        }
      });
    }

    appendCitation(citationsPerParagraph, destinationIdx, citationNumber);
    existingNumbers.add(citationNumber);
  });

  return rebuildTextWithCitations(segments, separators, citationsPerParagraph);
};

export const parseCitationGroup = (groupText: string): number[] => {
  return extractCitationNumbers(groupText);
};
