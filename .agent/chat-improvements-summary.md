# Chat Improvements Summary

## Overview
This document summarizes the improvements made to the chat system to handle scaling of source retrieval and improve citation formatting consistency.

## Changes Made

### 1. Dynamic K Scaling (Backend)
**File:** `/Users/jason/Code/CSE5914/backend/app/services/agent_service.py`

**Problem:** When users selected many papers, the chat would return `top_k` sources per paper, resulting in an overwhelming number of sources (e.g., 10 papers × 10 sources = 100 sources).

**Solution:** Implemented dynamic scaling of `k` based on the number of selected documents:
- **1-2 papers:** Up to 10 sources per paper
- **3-5 papers:** 5 sources per paper
- **6-10 papers:** 3 sources per paper
- **10+ papers:** 2 sources per paper

This ensures a more manageable number of total sources while maintaining coverage across all selected papers.

### 2. JSON Response Format with Inline Citations (Backend)
**Files:** 
- `/Users/jason/Code/CSE5914/backend/app/services/agent_service.py` (system prompt)
- `/Users/jason/Code/CSE5914/backend/app/api/routes_gemini.py` (response parsing)

**Problem:** Citations were being added post-hoc by the frontend, which could lead to inconsistent formatting and placement.

**Solution:** Updated the system prompt to instruct Gemini to return responses in JSON format:
```json
{
  "answer": "Your response text with inline citations like [1] and [2] embedded naturally in the text.",
  "sources_used": [1, 2, 3]
}
```

The backend now:
1. Accumulates tokens from Gemini's streaming response
2. Attempts to parse the complete response as JSON
3. Extracts the `answer` field which contains inline citations
4. Sends a `parsed_answer` event to the frontend with properly formatted text

### 3. Frontend Parsing (Frontend)
**File:** `/Users/jason/Code/CSE5914/frontend/app/chat/page.tsx`

**Changes:**
- Added handler for new `parsed_answer` event type
- When `parsed_answer` is received, it replaces the accumulated content with the properly formatted answer from Gemini
- Removed the `annotateWithCitations` call when sources are received (since citations are already inline)
- The `MessageWithCitations` component still calls `annotateWithCitations` as a fallback for non-JSON responses

## Benefits

1. **Scalable Source Retrieval:** Users can select many papers without getting overwhelmed by sources
2. **Consistent Formatting:** Citations are embedded by Gemini directly, ensuring they're contextually appropriate
3. **Better Citation Placement:** Gemini places citations where they make most semantic sense
4. **Backward Compatible:** The system gracefully handles both JSON and plain text responses

## Testing Recommendations

1. Test with different numbers of selected papers (1, 3, 6, 15) to verify k scaling
2. Verify that citations appear inline in responses
3. Check that sources list at the bottom matches the inline citations
4. Test with questions that require multiple sources
5. Verify backward compatibility with non-JSON responses

## Notes

- The system prompt explicitly instructs Gemini to use plain text (no markdown) in the answer field
- Citations should be inline like: "This is a fact [1]. Another fact [2]."
- The frontend still has fallback citation annotation logic for non-JSON responses
