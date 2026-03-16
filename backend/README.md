# Django Todo Backend

This is the backend component of the Django Todo application, built with Django, Django REST Framework, and PostgreSQL.

## Features

- **RESTful API**: Provided via Django REST Framework.
- **Database**: Configured to use PostgreSQL (via `psycopg2-binary` and `dj-database-url`).
- **Production Ready**: Uses `gunicorn` for serving and `whitenoise` for static files.
- **CORS Support**: Integrated CORS handling for frontend communication.

## Prerequisites

- [Python 3.x](https://www.python.org/)
- [PostgreSQL](https://www.postgresql.org/) (Recommended or fallback to SQLite)
- [Docker](https://www.docker.com/) (Optional, but recommended for database and containerized deployment)

## Getting Started

### 0. Database Setup

This project uses PostgreSQL managed via Docker. The `docker-compose.yml` file is located in the root directory.

```bash
# Navigate to project root and start the database
cd ..
docker compose up -d
cd backend
```

### 1. Environment Setup

Create an isolated environment using `venv`:

```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows, use `.venv\Scripts\activate`
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configuration

Copy the example environment variables file and update it with your credentials:

```bash
cp .env.example .env
```

Ensure the following variables in your `.env` file are set appropriately for your local environment:
- `DEBUG=True` (for local development)
- `DATABASE_URL` (format: `postgres://USER:PASSWORD@HOST:PORT/NAME`)
- `CORS_ALLOWED_ORIGINS` (Point to your frontend, e.g., `http://localhost:3000`)

### 4. Database Migrations

Run migrations to set up the database schema:

```bash
python3 manage.py migrate
```

### 5. Running the Development Server

Start the Django development server:

```bash
python3 manage.py runserver
```

> [!TIP]
> **Permission Issues?** If `python3` or `pip` fail with permission errors, use the binary directly from the virtual environment:
> `./.venv/bin/python3 manage.py runserver`

The API will be available at `http://127.0.0.1:8000/`.

## Deployment

For production deployment, this project is configured to run with `gunicorn` and uses `whitenoise` to serve static assets efficiently. Ensure you set `DEBUG=False` and supply a secure `SECRET_KEY` in your `.env` for production environments.
