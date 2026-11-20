# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## API testing

With the backend dependencies installed, run `php artisan serve --host=127.0.0.1 --port=8000` from `backend/`. From `frontend/`, run `npm ci` and `npm run dev`, then open `/testing/` on the Vite URL. The page calls `GET /api/testing` through Vite’s local proxy, then calls `GET /api/testing/database` to run a read-only query against Laravel's configured database.

For production, `npm run build` generates both `dist/index.html` and `dist/testing/index.html`. Serve `dist/` at the site root and route `/api/*` requests to Laravel on the same domain.
