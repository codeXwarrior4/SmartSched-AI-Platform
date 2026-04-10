# SmartSched AI Backend
MERN stack backend powered by Node.js.

## Modules
- `config/`: Envs and standard configuration via `dotenv`.
- `models/`: Mongoose Schemas strictly typing Admin, Class, Room, Subject, Teacher, and Timetable structures.
- `middleware/`: JWT verification payload gating API scope.
- `services/schedulerService.js`: The algorithmic engine. It computes vectors of unassigned subjects against the `TimetableEntry` collection index to find available combinations of `(Time, Day) => Room && Teacher`. 

## How to use
- Execute `npm start` or `npm run dev`.
- Make a `POST` request to `/api/auth/seed` to establish the root admin if none exists.
