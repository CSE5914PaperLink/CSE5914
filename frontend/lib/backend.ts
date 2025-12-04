/**
 * Centralized backend URL configuration
 * Use this instead of hardcoding backend URLs throughout the app
 */

// Server-side backend URL (for API routes)
export const getBackendUrl = (): string => {
  // Server-side: use BACKEND_URL environment variable
  if (typeof window === 'undefined') {
    return process.env.BACKEND_URL || 'http://localhost:8000';
  }
  
  // Client-side: use NEXT_PUBLIC_BACKEND_URL
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
};

// Helper function to build backend API URLs
export const buildBackendUrl = (path: string): string => {
  const baseUrl = getBackendUrl();
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/${cleanPath}`;
};

// Common backend endpoints
export const backendEndpoints = {
  health: () => buildBackendUrl('health'),
  arxiv: {
    search: () => buildBackendUrl('arxiv/search'),
    download: (docId: string) => buildBackendUrl(`arxiv/download/${docId}`),
  },
  openalex: {
    search: () => buildBackendUrl('openalex/search'),
    work: (id: string) => buildBackendUrl(`openalex/works/${id}`),
  },
  gemini: {
    chat: () => buildBackendUrl('gemini/chat'),
    chatAgent: () => buildBackendUrl('gemini/chat_agent'),
  },
  library: {
    list: () => buildBackendUrl('library/list'),
    add: (docId: string) => buildBackendUrl(`library/add/${docId}`),
    delete: (docId: string) => buildBackendUrl(`library/delete/${docId}`),
    checkBatch: () => buildBackendUrl('library/check_batch'),
    chunks: (docId: string) => buildBackendUrl(`library/chunks/${docId}`),
  },
  docling: {
    extract: () => buildBackendUrl('docling/extract'),
    extractUrl: () => buildBackendUrl('docling/extract_url'),
  },
  compare: () => buildBackendUrl('compare'),
};

