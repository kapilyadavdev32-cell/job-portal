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

## Deploy on Render

This repo includes a root-level `render.yaml` for a two-service deployment:

- `jobportal-api`: Node/Express backend
- `jobportal-web`: Vite/React static frontend

### Steps

1. Push the repo to GitHub.
2. In Render, create a new Blueprint and select this repository.
3. Fill the prompted variables:
   - `MONGO_URI`: your MongoDB Atlas URI
   - `CORS_ORIGIN`: your frontend URL, for example `https://jobportal-web.onrender.com`
   - `VERIFY_EMAIL_BASE_URL`: your backend URL, for example `https://jobportal-api.onrender.com`
   - `FORGOT_PASSWORD_REDIRECT_URL`: your frontend URL for reset flow
   - `VITE_API_BASE_URL`: your backend API URL, for example `https://jobportal-api.onrender.com/api/v1`
   - `GMAIL_USER` and `GMAIL_APP_PASSWORD`: optional, but needed for verification and reset emails
4. Deploy the Blueprint.

### Notes

- The frontend uses a client-side router, and `render.yaml` already adds the SPA rewrite rule.
- Cross-origin auth cookies need HTTPS and `sameSite=none`; the production config now uses that path.
- Resume uploads are stored under `backend/public/uploads/resumes`. On some hosts that storage is ephemeral, so if that becomes a problem later you can move uploads to cloud storage.
