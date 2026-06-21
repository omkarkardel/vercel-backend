# CampusHub Backend

Node.js + Express + MongoDB API for CampusHub.

## Run

```bash
npm install
npm run dev
```

## Environment

Create `.env` from `.env.example` and provide DB/JWT values.

## API Base

`/api/v1`

### Key Routes

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /users/me`
- `PATCH /users/me`
- `GET /events`
- `POST /events`
- `POST /events/:eventId/rsvp`
- `GET /teams`
- `POST /teams`
- `POST /teams/:teamId/join`
- `GET /clubs`
- `POST /clubs` (super admin)
- `POST /clubs/admin/announcements` (club admin)
- `GET /notifications`
- `GET /admin/activity` (super admin)