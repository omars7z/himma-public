# Himma

A Laravel 13 application built with Inertia.js, React 19, and Tailwind CSS v4.

---

## Requirements

| Dependency | Version |
|---|---|
| PHP | 8.3+ |
| Composer | 2.x |
| Node.js | 20+ |
| npm | 10+ |

All of the above are bundled with [Laravel Herd](https://herd.laravel.com/) — no manual installation needed.

---

## Installation

### 1. Install Herd

**macOS**
```bash
brew install --cask herd
```
Or download the installer directly from [herd.laravel.com](https://herd.laravel.com/).

**Windows**
Download and run the installer from [herd.laravel.com](https://herd.laravel.com/). Herd for Windows bundles PHP, Composer, Node.js, and nginx automatically.

### 2. Park your projects directory

Open Herd → Settings → General → add the parent folder that contains this project (e.g. `~/Herd`). Herd will automatically serve every sub-directory as `<directory-name>.test`.

### 3. Install dependencies

```bash
cd himma

composer install

npm install
```

### 4. Configure the environment

```bash
cp .env.example .env
php artisan key:generate
```

The default database driver is **SQLite** — no database server is needed.

```bash
touch database/database.sqlite
php artisan migrate
```

### 5. Build frontend assets

```bash
npm run build
```

### 6. Open the app

Visit **https://himma.test** in your browser. Herd handles HTTPS automatically.

> **Hot reloading:** Run `npm run dev` and keep the terminal open. Vite will proxy asset requests to the same `.test` URL with live updates.

---

## One-command setup

If Herd is already installed and you just need to bootstrap the project quickly:

```bash
composer run setup
```

This runs `composer install`, copies `.env`, generates the app key, runs migrations, installs npm packages, and builds assets in one go.

---

## Common commands

| Task | Command |
|---|---|
| Start all dev processes | `composer run dev` |
| Run migrations | `php artisan migrate` |
| Fresh migration + seed | `php artisan migrate:fresh --seed` |
| Build frontend (production) | `npm run build` |
| Start Vite HMR | `npm run dev` |
| Run the test suite | `php artisan test --compact` |
| Fix PHP code style | `vendor/bin/pint --dirty` |
| Lint TypeScript/JSX | `npm run lint` |
| Format TypeScript/JSX | `npm run format` |

---

## Database

The default configuration uses **SQLite** (stored at `database/database.sqlite`). No database server is required.

To switch to **MySQL** or **PostgreSQL**, update `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=himma
DB_USERNAME=root
DB_PASSWORD=
```

Then run `php artisan migrate`.

---

## Troubleshooting

**Frontend changes are not reflected in the browser**
Run `npm run build` or start `npm run dev` for hot reloading.

**`php artisan` throws class-not-found errors**
Run `composer install` to make sure all PHP dependencies are present.

**`Unable to locate file in Vite manifest` error**
Run `npm run build` to generate the manifest.

**Site not resolving at `.test`**
Open Herd and confirm the parent directory is parked. Restart Herd if needed.

**Permissions error on `storage/` or `bootstrap/cache/`**
```bash
chmod -R 775 storage bootstrap/cache
```
