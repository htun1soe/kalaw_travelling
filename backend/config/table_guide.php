<?php

return [
    'application' => [
        'purpose' => 'The default Laravel connection stores the content visitors can browse, regular user accounts, and the tables used by Laravel’s session, cache, queue, and migration tools.',
        'tables' => [
            'housing' => 'One property listing for sale or rent. Super-admins edit it through `/api/admin/housing`. The public `/api/housing` endpoints return each listing with zero or more contacts and photos. Deleting a listing also deletes its contact and photo rows.',
            'housing_contact' => 'One person to contact about a listing, with a name, phone number, and optional address. When the editor saves a listing, the API replaces its contact rows with the submitted list.',
            'housing_images' => 'One uploaded photo belonging to a listing. The row stores the path on Laravel’s public disk. The API turns the path into a `/storage/` URL and removes the file when an admin deletes the photo or listing.',
            'users' => 'One regular application account. Laravel’s `web` guard retrieves these accounts through the User model. The email identifies the account for password resets. The dashboard has its own account provider.',
            'password_reset_tokens' => 'The password broker matches `password_reset_tokens.email` to `users.email` in application code. When it issues a reset, it stores the token hash and creation time. When the user submits the token, the broker checks the hash and expiry.',
            'sessions' => 'With the database session driver, Laravel reads and writes a session payload by session ID and tracks its last activity. For the regular web guard, the optional `user_id` can hold `users.id`. MariaDB leaves this association to Laravel. The example local setup uses file sessions.',
            'personal_access_tokens' => 'Legacy Sanctum table present on older development volumes. Each token has an owner identified by `tokenable_type` and `tokenable_id`, a token hash, and optional abilities and expiry. Fresh migrations omit this table. Dashboard sign-in uses sessions.',
            'jobs' => 'One queued task awaiting a database queue worker. The worker reserves an available row, increments its attempts, and removes it after success or releases it for retry. The example local setup uses this queue driver.',
            'job_batches' => 'One group of tasks dispatched as a Laravel batch. Laravel updates pending and failed counts and records completion or cancellation. Batched jobs carry the batch ID in their payload.',
            'failed_jobs' => 'A failure record written when a queued job fails permanently and database failure logging is enabled. It preserves the job UUID, connection, queue, payload, and exception so a developer can inspect or retry it.',
            'cache' => 'With the database cache store, Laravel saves a value under a cache key and uses the expiration time to decide whether it is still usable. The example local setup uses file caching.',
            'cache_locks' => 'The database cache store uses a lock key, owner token, and expiry to coordinate workers competing for the same lock. A lock can exist independently of any cached value.',
            'migrations' => 'Laravel records each applied migration name and batch here. The migrator checks this history before applying changes and uses batch numbers to select migrations for rollback. A migration can change several tables or use the admin connection.',
        ],
    ],
    'administration' => [
        'purpose' => 'The dedicated super-admin connection stores dashboard accounts. When an admin saves a property, Laravel checks the signed-in account before writing the listing to the application database. This connects the two workflows through a session.',
        'tables' => [
            'super_admin' => 'One dashboard account with a unique username and a hashed password. The `superadmin` guard verifies it at `POST /api/auth/login`, then regenerates the session. During local development, sign-in synchronizes the environment-managed account. Access checks use the signed-in account at request time.',
        ],
    ],
];
