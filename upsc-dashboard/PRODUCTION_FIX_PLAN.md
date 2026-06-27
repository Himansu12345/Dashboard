# Production Fix Plan - UPSC Dashboard

## Summary of Errors to Fix

### 1. ESLint Errors (32 errors, 1 warning)

#### File: `app/report/ReportPageClient.tsx`

- Remove unused `readStoredSet` (line 13)
- Remove unused `readStoredNotes` (line 22)

#### File: `app/streak/StreakClient.tsx`

- Remove unused `syllabusTab` state (line 26)
- Remove unused `handleSyllabusTabChange` function (line 52)

#### File: `app/subject-dashboard/hooks/useSubjectDashboardState.ts`

- Add underscore prefix to unused parameters: `quizSubjectName` → `_quizSubjectName`
- Remove or prefix unused setters: `setCompletionTimes`, `setNodeStatuses`, `setIndeterminateUids`, `setNotes`, `setNodeRenderVersions`, `setTreeRenderVersion`, `setNoteDocuments`
- Add underscore prefix to unused callback params: `uid`, `content`, `noteId`
- Fix: Move `setVisibleUids` call outside of useEffect to avoid setState in effect

#### File: `features/quiz/QuizSessionPopup.tsx`

- Remove unused `formatPercent` (line 80)
- Remove unused `setActiveSection` (line 361)
- Remove unused `saveError` state (line 403) - Actually needed for error display, keep but fix reference
- Fix: Add `findNextPass2Question` to useCallback deps or useRef
- Remove unused `dispatch` (line 1031)

#### File: `hooks/useReportData.ts` (note: .js file)

- Remove unused `readStoredSet` (line 10)
- Remove unused `readStoredNotes` (line 19)

#### File: `report.js` (note: .js file)

- Remove unused `handleDateChange` (line 23)

## Implementation Steps

1. Fix each file with appropriate updates
2. Run build to verify
3. Test functionality
