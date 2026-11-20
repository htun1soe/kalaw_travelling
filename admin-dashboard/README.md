# Kalaw Travelling super-admin dashboard

A standalone React and Vite app for the home gallery, home stories, trending stories, and housing listings. It has its own dependencies and can be installed and built independently of the public site.

## Set up a development super-admin

Configure the local database and app key in `backend/.env`, then apply the migrations with `php backend/artisan migrate` from the repository root. The migrations create `super_admin` in the `kalaw_admins` schema. [Database setup](../docs/DATABASE.md)

With `APP_ENV=local`, set `SUPER_ADMIN_USERNAME` and `SUPER_ADMIN_PASSWORD` in `backend/.env`. Use letters, digits, underscores, or hyphens for the username and at least 12 characters for the password. Laravel creates or updates the development account when a sign-in is submitted and stores the password hash. Changing these values updates the same row on the next sign-in attempt. Production uses separately provisioned accounts in `super_admin` through the same guard.

## Run locally

Start Laravel on `127.0.0.1:8000` with `php artisan serve --host=127.0.0.1 --port=8000` from `backend/`. Use Node.js 22.12 or newer and run the following from the repository root.

```sh
cd admin-dashboard
npm ci
npm run dev
```

Open **http://127.0.0.1:3001** and enter the development username and password from `backend/.env`. The overview and collections use sample content. Reloading or signing out resets sample edits.

To demo sample screens without an account, start the development server with `VITE_AUTH_MODE=preview npm run dev` and choose **Preview dashboard**. Production builds require super-admin sign-in.

## Build and check

```sh
npm run lint
npm run build
npm run preview
```

Deploy `dist/` at the root of the dashboard's own HTTPS origin. Serve `index.html` for `/login` and `/dashboard/*` so direct links work. Forward `/api/*` on that origin to Laravel. Set `SESSION_SECURE_COOKIE=true` in Laravel's production environment.

## Session API

The browser uses same-origin `/api` requests. Vite proxies them to `API_PROXY_TARGET` during development, defaulting to `http://127.0.0.1:8000`. The dashboard sends session cookies and the `X-CSRF-TOKEN` header for writes. [Vite config](vite.config.js), [API client](src/services/api.js).

| Endpoint | Expected response |
| --- | --- |
| `GET /api/auth/csrf` | `200` with `{ "token": "…" }` |
| `POST /api/auth/login` with `{ "username": "…", "password": "…" }` | `200` with `{ "username": "…", "role": "super_admin" }` and a session cookie |
| `GET /api/auth/me` | `200` with the same user object, `401` for a missing session, or `403` for an account without super-admin access |
| `POST /api/auth/logout` | `204` after ending the session |

Use `auth:superadmin` and `can:access-super-admin` for future dashboard-only API routes. For venue-scoped actions, use Laravel policies that check the user's restaurant or hotel assignments. Super-admins pass these policy checks across the app.
