# TODO - Fix AI Breakdown errors

## Step 1: Make backend parsing robust
- [ ] Update `api/breakdown.js` to extract the JSON array from the model text (from first `[` to last `]`) instead of blindly `JSON.parse(cleaned)`.
- [ ] Return consistent error payload including `raw`/`cleaned` when parsing fails (for debugging).

## Step 2: Improve frontend error display
- [ ] Update `src/pages/AIBreakdownPage.jsx` to surface backend `details` when available.

## Step 3: Verify runtime env
- [ ] Confirm `ANTHROPIC_API_KEY` is present in the environment where `/api/breakdown` runs.

