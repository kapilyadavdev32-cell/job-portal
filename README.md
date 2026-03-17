# Job Portal

This workspace now has:

- `backend/`: Express + MongoDB API
- `frontend/`: Vite + React client

## Run locally

1. Backend setup:
   - Copy `backend/.env.example` to `backend/.env`
   - Set your MongoDB and token secrets
   - Run `npm install` inside `backend`

2. Frontend setup:
   - Copy `frontend/.env.example` to `frontend/.env` if you want a different API URL
   - Run `npm install` inside `frontend`

3. Start both apps in separate terminals:
   - `npm run backend`
   - `npm run frontend`

## Default ports

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- API base: `http://localhost:8000/api/v1`
