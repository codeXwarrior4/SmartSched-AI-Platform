# SmartSched AI - Platform

## Overview
SmartSched AI is a modern, algorithmically-driven academic scheduling system. It replaces tedious manual planning with a robust engine that balances teacher constraints, room logistics, and subject requirements into perfectly clash-free Timetable Matrices.

### Features
- **Algorithmic Engine**: Enforces exact constraints including `maxLecturesPerDay`, resolving conflicts efficiently with dynamic spreading heuristics and structured telemetry reporting.
- **Dynamic Configuration**: Adjustable daily limits and working days via DB-driven metrics.
- **Multi-View Analytics**: Rich pie charts and telemetry tracking unused facility slots vs actual loads across professors and labs.
- **Export & Matrix**: Interactive table views filtered instantly by individual `Class` or `Teacher`, packaged flawlessly into custom landscape localized PDFs.

### Architecture
- **backend/**: A secure Node.js/Express.js service mapping to a MongoDB datastore (Mongoose ORM). Contains the algorithmic core (`schedulerService.js`) dynamically managing multi-dimensional relations.
- **frontend/**: A stunning, vibrant Vite+React SPA using TailwindCSS. Connects to the backend via JWT-secured Axios calls and displays live `recharts` arrays.

### Requirements & Environment
Before running the system, securely copy the example environment file inside `backend/`:
```bash
cp backend/.env.example backend/.env
```
Ensure your `backend/.env` contains valid credentials:
- `MONGO_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A strictly secure high-entropy string enabling user sessions.
- `PORT`: (Default: `5000`)

### Setup Instructions
1. Run `cd backend`, `npm install`, and `npm run dev`. The server securely verifies the environment on startup.
2. Run `cd frontend`, `npm install`, and `npm run dev`.

The Frontend serves on `http://localhost:5173`.
The Backend API serves on `http://localhost:5000`.

### Database Schema Map
- `Admin`: `{ username, password }`
- `Teacher`: `{ name, email, maxLecturesPerWeek, maxLecturesPerDay, availability }`
- `Class`: `{ name, semester, dept }`
- `Subject`: `{ name, code, weeklyLectures, type, classId, teacherIds[] }`
- `Room`: `{ name, capacity, type }`
- `SlotConfig`: `{ workingDays[], lecturesPerDay }`
- `TimetableEntry`: `{ day, slot, classId, subjectId, teacherId, roomId }`
