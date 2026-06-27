# Report System Implementation TODO

## Phase 1: Understanding Current State ✅
- [x] Analyzed quiz attempts storage (MongoDB backend)
- [x] Analyzed subject completion storage (localStorage)
- [x] Analyzed star actions storage (localStorage + reportUtils.ts)
- [x] Analyzed study sessions (partial implementation)
- [x] Reviewed existing Report Page
- [x] Reviewed Navbar (Report button exists)

## Phase 2: Implementation Plan

### Step 1: Enhance Report Types
- [ ] Update types/report.ts with expanded interfaces

### Step 2: Enhance Report Utilities
- [ ] Update lib/reportUtils.ts with:
  - Better date filter presets (today, yesterday, last7days, last30days, this month, previous month, custom)
  - JSON export with AI-ready structure
  - Analytics aggregation helpers

### Step 3: Rebuild Report Page Client
- [ ] Update app/report/ReportPageClient.tsx with:
  - Date filter dropdown with presets
  - Summary cards (total, correct, wrong, accuracy)
  - Activity timeline
  - JSON export button
  - Session tracking integration

### Step 4: Testing & Validation
- [ ] Test date filtering
- [ ] Test JSON export format
- [ ] Verify accuracy calculations
- [ ] Validate all required fields present

## Data Sources Identified:
1. Quiz Attempts → MongoDB (via /api/attempt)
2. Subject Completion → localStorage (completion_times_{subject})
3. Star Actions → localStorage (star_actions_{subject})
4. Study Sessions → localStorage (study_sessions)

## Missing Data to Track:
1. Answer change history - NOT currently stored
2. Per-question time taken - NOT currently stored in reports (only in quiz session)
3. Session tracking - PARTIALLY implemented
