export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai" | "system";
  sources?: SourceChunk[];
  images?: any[];
  status?: string;
}

export interface LibraryItem {
  id: string;
  metadata: {
    doc_id: string;
    title: string;
    arxiv_id?: string;
    authors?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface SourceChunk {
  id: string;
  type: "text" | "image";
  doc_id?: string;
  distance?: number;
  content?: string;
  chunk_index?: number;
  page?: number;
  heading?: string;
  citation_number?: number;
  filename?: string;
  url?: string;
  image_data?: string;
  caption?: string;
  bbox?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
}

