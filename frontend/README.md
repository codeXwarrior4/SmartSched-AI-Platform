# SmartSched AI Frontend
Vite React portal tailored with Tailwind CSS and Recharts.

## Architecture Map
- `api/`: Bound `axios` instance carrying JWT logic on request intercepts.
- `layouts/DashboardLayout.jsx`: Responsive multi-view wrapper providing the Navigation Sidebar.
- `pages/`: 
  - `Login.jsx` -> Submits via Form State -> Updates LocalStorage Token.
  - Entity Managers -> Pure CRUD maps.
  - `TimetableDisplay.jsx` -> Cross references matrix vectors to render a polished web table. Features PDF print exports via `jspdf`.

## Startup
`npm install` then `npm run dev`.
