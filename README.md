# Kalaw Travelling

## Progress on November 20, 2026

### Public frontend and diagnostics

- The public React app lives in `frontend/` and builds for the root of `kalawtravelling.com`. [Public frontend](frontend/)
- The homepage footer links to `/testing/`. This page checks the Laravel API and the database connection separately. `GET /api/testing` checks the API response, and `GET /api/testing/database` runs a read-only `SELECT 1`. [Testing page](frontend/testing/index.html)
- Vite forwards local `/api/*` requests to Laravel on port `8000`. The production plan uses same-origin API forwarding for both frontends.

### Super-admin dashboard

- The dashboard lives in `admin-dashboard/` with its own React build and development server. The intended production address is `admin.kalawtravelling.com`. [Super-admin dashboard](admin-dashboard/)
- Laravel uses a dedicated session guard and CSRF protection for super-admin sign-in. It reads accounts from `kalaw_admins.super_admin`. With `APP_ENV=local`, submitting the sign-in form creates or updates the development account from `SUPER_ADMIN_USERNAME` and `SUPER_ADMIN_PASSWORD`. MariaDB stores the password hash. [Super-admin setup](admin-dashboard/README.md)
- Home Gallery, Home Stories, Trending, and Housing each define their add and edit fields in their own React component. They share the collection and editor components. [Home Gallery](admin-dashboard/src/pages/HomeGallery.jsx), [Home Stories](admin-dashboard/src/pages/HomeStories.jsx), [Trending](admin-dashboard/src/pages/Trending.jsx), [Housing](admin-dashboard/src/pages/Housing.jsx)
- Housing supports adding, editing, and removing sample listings, filtering by sale or rent, availability, and publication status, and entering property details, a map link, and photo selections. The desktop table becomes listing cards on narrow screens. Preview changes stay in the current tab and reset on reload or sign-out.

### Database

- Docker Compose builds a local MariaDB 11.8 service that listens at `127.0.0.1:3307`. A named volume holds `kalaw_db` for application data and `kalaw_admins` for super-admin accounts. [Compose configuration](compose.yaml)
- Removed SQLite from the application setup and removed the unused personal-access-token migration from fresh installs. The app uses Laravel sessions for admin sign-in.

## Run locally

For a fresh setup, create `backend/.env` from the environment template and configure the MariaDB passwords and development super-admin credentials there. Install Laravel dependencies with `composer install` from `backend/`, and generate the app key with `php artisan key:generate` if `APP_KEY` is empty. [Environment template](backend/.env.example)

From the repository root, start the database and apply migrations.

```sh
docker compose --env-file backend/.env up -d --build --wait mariadb
php backend/artisan migrate --no-interaction
```

Run each command in a separate terminal from the repository root.

```sh
php backend/artisan serve --host=127.0.0.1 --port=8000
(cd frontend && npm ci && npm run dev)
(cd admin-dashboard && npm ci && npm run dev)
```

| Service | Local address |
| --- | --- |
| Public site | [http://127.0.0.1:5173/](http://127.0.0.1:5173/) |
| API and database checks | [http://127.0.0.1:5173/testing/](http://127.0.0.1:5173/testing/) |
| Super-admin sign-in | [http://127.0.0.1:3001/login](http://127.0.0.1:3001/login) |
| Laravel API | `http://127.0.0.1:8000/api/` |
| MariaDB | `127.0.0.1:3307` |

## Verification

- Verified fresh Docker initialization for both schemas and ran nine targeted Laravel tests covering diagnostics and super-admin access.
- Verified live super-admin sign-in, session restoration, and sign-out in the browser.
- Built and linted both React apps. Browser checks covered all four category routes, preview saves, Housing filters, and mobile listing cards.

[Database setup](docs/DATABASE.md) · [Database test setup](docs/DEVELOPMENT.md)


## For Htwin Soe ဆက်လုပ်ရန်။

- Use housing.jsx for super-admin dashboard for housing adding.
- Link housing category in super-admin to databse base using backend.
- Use database schema kalaw_db. and table housing.
- Columns must be include id,title,area,price,description.
- Another table be the housing_contact , in which , the columns be name, phonenumber, and address.
- Adding contact section must be dynamically adding in super_admin dashboard's housing component.
- Make also react frontend for client , including galleries and data from kalaw_db. Don't add map.
- ကျန်တာအဆင် ပြေသလိုလုပ်လိုက်။
-  Admin schema is only for admin logins and authentication.
- Use kalaw_db schema for get and post data between fronend and backend.