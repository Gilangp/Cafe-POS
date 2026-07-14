# Velvra Backend API

Laravel-based REST API for Velvra Coffee Shop Management Platform.

## Requirements

- PHP 8.2+
- PostgreSQL 15+
- Redis 7+
- Composer 2.x

## Installation

1. Install dependencies:
   ```bash
   composer install
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Generate application key:
   ```bash
   php artisan key:generate
   ```

4. Run migrations:
   ```bash
   php artisan migrate
   ```

5. Seed database (optional):
   ```bash
   php artisan db:seed
   ```

## Development

Start the development server:
```bash
php artisan serve
```

API will be available at http://localhost:8000

## Testing

```bash
php artisan test
```

## API Documentation

OpenAPI spec available at /api/documentation when running.
