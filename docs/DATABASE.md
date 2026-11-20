# Local MariaDB

Copy `backend/.env.example` to `backend/.env` for a fresh setup. Set `DB_PASSWORD` for the `admin` database user and choose a separate `MARIADB_ROOT_PASSWORD`. Compose initializes `kalaw_db` and `kalaw_admins` in a new volume and grants the application user access to both. Laravel migrations create the super-admin account table in `kalaw_admins`.

With Docker running, execute these commands from the repository root.

```sh
docker compose --env-file backend/.env up -d --wait mariadb
php backend/artisan migrate --no-interaction
```

Laravel connects to `127.0.0.1:3307`. The [testing page](http://127.0.0.1:5173/testing/) checks the configured connection when the public frontend and Laravel are running.
