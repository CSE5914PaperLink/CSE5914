export type PaperMetadata = {
  title?: string;
  arxiv_id?: string;
  authors?: string[] | string;
  published?: string;
  summary?: string;
  pdf_url?: string;
  [key: string]: unknown;
};

export type LibraryItem = {
  id: string;
  metadata: PaperMetadata;
  document?: string | null;
};

export type Citation = {
  id: string;
  docId: string;
  title?: string;
  heading?: string | null;
  pages?: number[];
  snippet?: string;
  pdfUrl?: string | null;
  chunkIndex?: number;
  score?: number | null;
};

export type HighlightRequest = {
  requestId: string;
  docId: string;
  chunkId?: string;
  snippet?: string;
  pageNumber?: number;
};

export type ChatMessage = {
  id: string;
  text: string;
  sender: "user" | "ai" | "system";
  citations?: Citation[];
};
