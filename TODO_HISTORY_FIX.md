# TODO: History date + re-add fixes

## Step 1: Fix invalid date rendering
- [ ] Update `src/components/LibraryPanel.jsx` to stop using non-existent fields (`completedAt`, `deletedAt`, `addedToHistoryAt`).
- [ ] Use `completed_at` for completed timestamps and `created_at` for added timestamps.
- [ ] Add safe formatting helpers to avoid `Invalid Date`.

## Step 2: Wire “re-add from history” to real mutations
- [ ] Update `src/TodoLanding.jsx` to pass a real handler into `LibraryPanel`.
- [ ] Implement restore logic via `useTasks`/Supabase:
  - Completed -> Active: set `completed=false`, `completed_at=null`.
  - Deleted -> Active: if delete columns exist, set `deleted=false`, `deleted_at=null`; otherwise insert a new row with text.
- [ ] Update `src/components/LibraryPanel.jsx` to call the passed handler instead of local-only state updates.

## Step 3: Verify
- [ ] Run `npm run dev` (or `npm run build`) and ensure the history panel renders valid dates.
- [ ] Test: re-add a completed and a deleted task from History page and confirm it appears in My Tasks.

