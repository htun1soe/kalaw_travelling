# Database and table guide

Each entry describes what one row represents and how Laravel uses it. For column types and keys, see the [schema diagram and column reference](DATABASE_SCHEMA.md).

## `kalaw_db`

The default Laravel connection stores the content visitors can browse, regular user accounts, and the tables used by Laravel’s session, cache, queue, and migration tools.

| Table | Purpose and use |
| --- | --- |
| `cache` | With the database cache store, Laravel saves a value under a cache key and uses the expiration time to decide whether it is still usable. The example local setup uses file caching. |
| `cache_locks` | The database cache store uses a lock key, owner token, and expiry to coordinate workers competing for the same lock. A lock can exist independently of any cached value. |
| `failed_jobs` | A failure record written when a queued job fails permanently and database failure logging is enabled. It preserves the job UUID, connection, queue, payload, and exception so a developer can inspect or retry it. |
| `housing` | One property listing for sale or rent. Super-admins edit it through `/api/admin/housing`. The public `/api/housing` endpoints return each listing with zero or more contacts and photos. Deleting a listing also deletes its contact and photo rows. |
| `housing_contact` | One person to contact about a listing, with a name, phone number, and optional address. When the editor saves a listing, the API replaces its contact rows with the submitted list. |
| `housing_images` | One uploaded photo belonging to a listing. The row stores the path on Laravel’s public disk. The API turns the path into a `/storage/` URL and removes the file when an admin deletes the photo or listing. |
| `job_batches` | One group of tasks dispatched as a Laravel batch. Laravel updates pending and failed counts and records completion or cancellation. Batched jobs carry the batch ID in their payload. |
| `jobs` | One queued task awaiting a database queue worker. The worker reserves an available row, increments its attempts, and removes it after success or releases it for retry. The example local setup uses this queue driver. |
| `migrations` | Laravel records each applied migration name and batch here. The migrator checks this history before applying changes and uses batch numbers to select migrations for rollback. A migration can change several tables or use the admin connection. |
| `password_reset_tokens` | The password broker matches `password_reset_tokens.email` to `users.email` in application code. When it issues a reset, it stores the token hash and creation time. When the user submits the token, the broker checks the hash and expiry. |
| `personal_access_tokens` | Legacy Sanctum table present on older development volumes. Each token has an owner identified by `tokenable_type` and `tokenable_id`, a token hash, and optional abilities and expiry. Fresh migrations omit this table. Dashboard sign-in uses sessions. |
| `sessions` | With the database session driver, Laravel reads and writes a session payload by session ID and tracks its last activity. For the regular web guard, the optional `user_id` can hold `users.id`. MariaDB leaves this association to Laravel. The example local setup uses file sessions. |
| `users` | One regular application account. Laravel’s `web` guard retrieves these accounts through the User model. The email identifies the account for password resets. The dashboard has its own account provider. |

## `kalaw_admins`

The dedicated super-admin connection stores dashboard accounts. When an admin saves a property, Laravel checks the signed-in account before writing the listing to the application database. This connects the two workflows through a session.

| Table | Purpose and use |
| --- | --- |
| `super_admin` | One dashboard account with a unique username and a hashed password. The `superadmin` guard verifies it at `POST /api/auth/login`, then regenerates the session. During local development, sign-in synchronizes the environment-managed account. Access checks use the signed-in account at request time. |

## Foreign key relationships

Each row is a constraint enforced by MariaDB. The last two columns describe what happens to child rows when the referenced parent key changes or the parent row is deleted. Application-managed associations, such as password resets by email, are explained with their tables above.

| Child table and columns | Parent table and columns | On update | On delete |
| --- | --- | --- | --- |
| `kalaw_db.housing_contact (housing_id)` | `kalaw_db.housing (id)` | RESTRICT | CASCADE |
| `kalaw_db.housing_images (housing_id)` | `kalaw_db.housing (id)` | RESTRICT | CASCADE |

See the [database developer guide](DATABASE.md#keep-the-documentation-current) for refresh instructions and how to document a new table.
