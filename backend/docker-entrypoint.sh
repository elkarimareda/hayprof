#!/bin/bash
set -e

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
while ! php -r "
try {
    \$pdo = new PDO('mysql:host=mysql;port=3306;dbname=hayprof', 'root', 'root');
    echo 'Connected successfully';
    exit(0);
} catch (PDOException \$e) {
    exit(1);
}
"; do
    echo "MySQL is unavailable - sleeping"
    sleep 2
done

echo "MySQL is ready - executing command"

# Run migrations first to create tables
php artisan migrate --force

# Then clear caches
php artisan optimize:clear

# Execute the main command
exec "$@"
