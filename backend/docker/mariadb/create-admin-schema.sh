#!/bin/sh

(
  set -eu

  case "$MARIADB_SUPER_ADMIN_DATABASE" in
    ''|*[!a-zA-Z0-9_]*) echo 'Invalid super-admin database name.' >&2; exit 1 ;;
  esac
  case "$MARIADB_USER" in
    ''|*[!a-zA-Z0-9_-]*) echo 'Invalid MariaDB application username.' >&2; exit 1 ;;
  esac

  MYSQL_PWD="$MARIADB_ROOT_PASSWORD" mariadb --protocol=socket --user=root <<SQL
CREATE DATABASE IF NOT EXISTS \`$MARIADB_SUPER_ADMIN_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON \`$MARIADB_SUPER_ADMIN_DATABASE\`.* TO '$MARIADB_USER'@'%';
SQL
)
