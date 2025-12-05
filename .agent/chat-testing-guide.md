# Testing Guide for Chat Improvements

## Quick Test Steps

### 1. Test Dynamic K Scaling

1. Go to the chat page
2. Select **1 paper** from the sidebar
3. Ask a question like "What is this paper about?"
4. Check the backend logs - you should see: `Scaling k from 10 to 10 for 1 documents`
5. Note the number of sources returned

6. Select **5 papers** from the sidebar
7. Ask another question
8. Check the backend logs - you should see: `Scaling k from 10 to 5 for 5 documents`
9. Note that you get approximately 25 sources total (5 papers × 5 sources)

10. Select **15 papers** from the sidebar
11. Ask another question
12. Check the backend logs - you should see: `Scaling k from 10 to 2 for 15 documents`
13. Note that you get approximately 30 sources total (15 papers × 2 sources)

### 2. Test JSON Response Format

1. Open the browser's developer console (Network tab)
2. Ask any question with papers selected
3. Look at the streaming response from `/api/chat`
4. You should see events like:
   - `{"type": "status", "value": "thinking"}`
   - `{"type": "status", "value": "searching"}`
   - `{"type": "token", "value": "..."}`
   - `{"type": "parsed_answer", "value": "Your answer with [1] inline [2] citations..."}`
   - `{"type": "sources", "value": {...}}`

### 3. Test Inline Citations Display

1. Ask a question that requires multiple sources
2. Look at the response text
3. Verify that citations appear **inline** within sentences like: "This is a fact [1]."
4. Click on the inline citation numbers - should highlight the source in the PDF viewer
5. Expand the "Sources Used" section at the bottom
6. Verify that the source numbers match the inline citations

### 4. Visual Verification

The response should look like:
```
The paper introduces a new method for image classification [1]. 
The authors achieved 95% accuracy on the CIFAR-10 dataset [2]. 
This approach is based on convolutional neural networks [1].

[Sources Used: 2 referenced]
```

**NOT** like:
```
The paper introduces a new method for image classification.
The authors achieved 95% accuracy on the CIFAR-10 dataset.
This approach is based on convolutional neural networks. [1, 2]
```

## Expected Behavior

### K Scaling
- 1-2 papers: max 20 sources total
- 3-5 papers: max 25 sources total
- 6-10 papers: max 30 sources total
- 10+ papers: max 30-40 sources total

### Citation Format
- Citations should appear inline: `[1]`, `[2]`, etc.
- Each citation should be clickable
- Citations should be contextually placed within sentences
- The source list should match the cited numbers

## Troubleshooting

### If citations are not appearing inline:
1. Check the backend logs for: `Warning: Could not parse Gemini response as JSON`
2. This means Gemini returned plain text instead of JSON
3. The system should fall back to the old citation annotation logic

### If k scaling is not working:
1. Check the backend logs for the scaling message
2. Verify that `doc_ids` are being sent in the request
3. Check that the agent_service.py changes were applied

### If the frontend shows errors:
1. Check the browser console for JavaScript errors
2. Verify that the `parsed_answer` event handler is working
3. Check that TypeScript compilation succeeded
