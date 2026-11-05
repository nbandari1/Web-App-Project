# Tasks and activity analytics (#105, #123)

Start backend from `web-app/backend` and frontend from `web-app/frontend` with `npm run dev` in separate terminals. Both have committed lockfiles (`npm ci` to restore dependencies).

## Tasks
Search matches task titles case-insensitively. Search, status and priority filters intersect; Clear filters restores the full list. Existing live updates, creation, deletion, completion and deadline ordering remain. New tasks persist low/medium/high priority; legacy tasks default to medium without a database migration. Status supports todo/in_progress/completed. Deadline rank remains distinct from priority.

## Analytics
The dashboard requests authenticated `GET /api/mal/activity`, using the existing encrypted token store and refresh service. The backend follows paginated MAL anime-list results and calculates watched episodes multiplied by average episode duration in seconds. It never exposes tokens. Missing durations are counted and excluded, not guessed. Total estimates do not include untracked rewatches. Charts show the five largest titles plus Other titles; click bars or focus/select doughnut segments for details.

Only lifetime MAL estimates are supported by current source data. Date filters explicitly show unavailable instead of treating list update timestamps as watch sessions. Steam/Spotify and measured activity remain unavailable because no supported activity endpoints exist. Previous hardcoded overview figures have been removed. No mock activity is presented as real.

## Environment blockers
Backend requires valid FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, JWT_SECRET (and optional PORT, default 5000). A Firestore service/account with access is required. Presence of credentials does not verify cloud connectivity.
MAL requires MAL_CLIENT_ID, MAL_CLIENT_SECRET, MAL_REDIRECT_URI registered with MAL, MAL_TOKEN_ENCRYPTION_KEY (base64 encoding of 32 bytes), and FRONTEND_URL. These MAL settings are absent in the inspected local environment. Link an account from the dashboard after configuring them and signing in again. Login now includes cookies for the existing direct localhost API URL. Use localhost consistently for both services. Cross-site production cookie policy is outside this change.
Frontend requires NEXT_PUBLIC_API_URL and supports BACKEND_URL (defaults to http://127.0.0.1:5000) for its existing proxy.

## Verification
- Frontend: npm run lint; npx tsc --noEmit; npm run build
- Task filtering: node --experimental-strip-types --test lib/taskFilters.test.mjs (Node 24)
- Backend: npx tsc --noEmit; node -r ts-node/register --test server/src/test/activity.test.cjs
- Existing backend npm test is a failing placeholder. Existing Firestore test is not run because it can write cloud data.
- Live linked-account analytics and cloud task CRUD require configured services and manual verification; unit tests use synthetic fixtures only.
