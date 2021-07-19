#!/bin/bash
set -e

createdb $DB_NAME;

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" <<-EOSQL
    GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $POSTGRES_USER;
EOSQL