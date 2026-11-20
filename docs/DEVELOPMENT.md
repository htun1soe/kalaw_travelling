## Database tests

From `backend/`, run `php artisan test`. Tests that create users or write sessions require `TEST_DATABASE_URL` in the test process environment. Point it to a dedicated disposable database. The tests reset its schema before running.

With `TEST_DATABASE_URL` unset, the database-backed tests are skipped and the API diagnostic tests use simulated database responses.
