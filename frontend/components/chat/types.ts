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

export type ImageAsset = {
  filename: string;
  url: string;
  media_type?: string;
  page?: number;
  doc_id?: string;
};

export type ChatMessage = {
  id: string;
  text: string;
  sender: "user" | "ai" | "system";
  images?: ImageAsset[];
};
