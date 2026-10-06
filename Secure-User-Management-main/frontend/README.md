# Secure User Management frontend

The React client is a Vite application. It uses the Spring API in this project, with one Axios client for authentication, user, appointment, notification, and administrator requests.

## Run locally

1. Start Spring Boot from the project root: `.\mvnw.cmd spring-boot:run`
2. In `frontend`, install packages once with `npm install`.
3. Start the client with `npm run dev`.
4. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

Vite proxies `/api` and `/uploads` to `http://localhost:8081`, so local development uses the same origin and does not need a separate CORS setup. If the backend runs elsewhere, set `VITE_BACKEND_URL` in `frontend/.env.local`.

## Build and serve through Spring Boot

Run `npm run build` from `frontend`. Vite writes the compiled app to `src/main/resources/static/frontend`. Start or restart Spring Boot and open `http://localhost:8081/frontend/`. Client-side routes such as `/frontend/profile` are forwarded to the React entry page; API requests remain under `/api`.

To point the client directly at a different API origin, set `VITE_API_BASE_URL` to its API base URL (for example, `https://api.example.com/api`). That API must allow the frontend origin through CORS.

## Backend contract

- Login: `POST /api/auth/login`; the client validates the returned JWT and generated `userId`, then fetches `GET /api/users/profile` before opening protected pages.
- Profile: `GET` and `PUT /api/users/profile`; password change: `PUT /api/users/change-password`.
- Appointments: `GET` and `POST /api/appointments/user/{userId}`.
- Notifications: `/api/notifications/user/{userId}`.
- Admin data: `/api/dashboard/stats`, `/api/reports/users/monthly`, `/api/users/page`, and `/api/audit-logs`.

The API client adds the saved bearer token to requests. A 401 response from an authenticated request clears the session and returns the user to the sign-in route; a failed sign-in remains on the sign-in page with its server error.

## Checks

- `npm run lint`
- `npm run build`
- From the project root, `npm run test:e2e` builds the React client and runs the Playwright suite against Spring Boot.
