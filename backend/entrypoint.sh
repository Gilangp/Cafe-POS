#!/bin/bash
set -e

# Use PORT from environment variable or fallback to 80
PORT=${PORT:-80}

echo "Configuring Apache to listen on port ${PORT}..."
sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf
sed -i "s/*:\${PORT}/*:${PORT}/g" /etc/apache2/sites-available/000-default.conf

# Ensure storage permissions are writable
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Clear cached configuration during boot
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Run database migrations automatically on Render deploy if database environment variables are configured
if [ -n "$DB_HOST" ] || [ -n "$DATABASE_URL" ]; then
    echo "Running database migrations..."
    php artisan migrate --force || echo "Migration skipped or encountered warning."
fi

# Create storage symlink if not already created
if [ ! -d "/var/www/html/public/storage" ]; then
    php artisan storage:link || true
fi

echo "Starting Apache server..."
exec apache2-foreground
