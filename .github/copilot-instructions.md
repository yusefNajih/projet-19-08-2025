# Copilot Instructions for AutoRent Cherkaoui

## Project Architecture
- **Monorepo**: Contains `frontend/` (React + Vite) and `backend/` (Node.js/Express + MongoDB).
- **Frontend**: Located in `frontend/src/components/`, uses custom UI components (Dialog, Card, Input, etc.), i18n with `i18n.js`, and API calls via `frontend/src/services/api.js`.
- **Backend**: Located in `backend/`, with RESTful routes in `backend/routes/`, Mongoose models in `backend/models/`, and middleware in `backend/middleware/`.
- **Data Flow**: Frontend communicates with backend via REST API (see `api.js`), backend uses Mongoose for MongoDB access.

## Developer Workflows
- **Start Backend**: Use `start_autorent.bat` or `start_autorent.ps1` from the root directory.
- **Start Frontend**: Run `pnpm install` then `pnpm dev` inside `frontend/`.
- **API Endpoints**: See `backend/routes/` for available endpoints (e.g., `/clients`, `/vehicles`, `/reservations`).
- **Debugging**: Use extensive `console.log` in backend and frontend for tracing. Backend errors are logged to the console.

## Project-Specific Patterns
- **Form Handling**: All major forms (client, reservation, vehicle) use controlled components and local state. For edit, forms are pre-filled and submit updates via API.
- **Modals**: Add/edit forms are shown in modals (Dialog/Card pattern). Use `showForm` and `editClientId` (or similar) state to toggle.
- **i18n**: All user-facing text uses the `t()` function from `react-i18next`.
- **Date Handling**: Dates are stored as ISO strings; forms use `type="date"` and slice to `YYYY-MM-DD` for input values.
- **Status Badges**: Status fields (e.g., client, vehicle) use color-coded badges, see `statusColors` in components.

## Integration & Conventions
- **API Layer**: All API calls go through `frontend/src/services/api.js`.
- **Component Structure**: Each major entity (Client, Vehicle, Reservation) has a management component and a form component.
- **Validation**: Backend uses express-validator; frontend does basic required checks.
- **Authentication**: JWT-based, with role/permission checks in backend middleware.
- **RTL & Bilingual**: UI supports French/Arabic and RTL layouts (see i18n setup).

## Examples
- To add or edit a client, use the form in `ClientManagement.jsx`, which toggles between add/edit based on `editClientId`.
- To fetch paginated data, use the `fetchClients`, `fetchVehicles`, or `fetchReservations` pattern (see respective management components).
- For custom UI, see `frontend/src/components/ui/` for reusable elements.

## Key Files & Directories
- `frontend/src/components/ClientManagement.jsx` (client CRUD, form logic)
- `frontend/src/components/ReservationManagement.jsx` (reservation CRUD)
- `backend/routes/` (API endpoints)
- `backend/models/` (Mongoose schemas)
- `frontend/src/services/api.js` (API abstraction)
- `README.md` (feature overview)

---
If you are unsure about a workflow or pattern, check the relevant management component or API service for examples. When in doubt, prefer explicit state and clear UI feedback.
