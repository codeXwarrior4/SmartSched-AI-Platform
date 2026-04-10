# SmartSched AI - Root Project

## Overview
SmartSched AI is a modern, algorithmically-driven academic scheduling system. It replaces tedious manual planning with a robust engine that balances teacher constraints, room logistics, and subject requirements into perfectly clash-free Timetable Matrices.

### Architecture
- **backend/**: A secure Node.js/Express.js service mapping to a MongoDB datastore (Mongoose ORM). Contains the algorithmic core (`schedulerService.js`) which greedily processes combinations.
- **frontend/**: A beautiful Vite+React+Tailwind SPA. Connects to backend via JWT-secured Axios calls. Includes live `recharts` telemetry and PDF rendering engines.

### Setup Instructions
1. Run `cd backend`, `npm install`, and `npm run dev`.
2. Run `cd frontend`, `npm install`, and `npm run dev`.

The Frontend serves on `http://localhost:5173`.
The Backend API serves on `http://localhost:5000`.

### Database Schema Map
- `Admin`: `{ username, password }`
- `Teacher`: `{ name, email, maxLectures, availability }`
- `Class`: `{ name, semester, dept }`
- `Subject`: `{ name, code, weeklyLectures, type, classId, teacherIds[] }`
- `Room`: `{ name, capacity }`
- `TimetableEntry`: `{ day, slot, classId, subjectId, teacherId, roomId }`
