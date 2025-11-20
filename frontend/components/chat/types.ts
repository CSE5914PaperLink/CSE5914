export type PaperMetadata = {
  title?: string;
  doc_id?: string;
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

export type SourceChunk = {
  id: string;
  type: "text" | "image";
  doc_id?: string;
  title?: string; // Paper title
  heading?: string;
  caption?: string;
  distance?: number;
  content?: string;
  chunk_index?: number;
  page?: number;
  filename?: string;
  url?: string;
  image_data?: string; // base64 encoded image data
  citation_number?: number;
  bbox?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
};

export type ChatMessage = {
  id: string;
  text: string;
  sender: "user" | "ai" | "system";
  images?: ImageAsset[];
  sources?: SourceChunk[];
  status?: string; // Agent status: "thinking", "searching", "answer", etc.
};
