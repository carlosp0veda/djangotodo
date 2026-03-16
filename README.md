# Project Structure

This is a modern full-stack web application.

## 🚀 Welcome

This project follows a decoupled architecture, separating the client-side user interface from the server-side API and database.

## 📂 Architecture Overview

For a detailed look at the system design and data flow, please see the [Architecture Overview](docs/architecture-overview.md).

The repository is organized into two main directories:

*   **`frontend/`**: Contains the client application built with Next.js 16, React 19, and TypeScript. Handles all UI, state management (Zustand), and data fetching (React Query).
*   **`backend/`**: Contains the server application (typically Django/Python). Manages business logic, database models, and provides the REST/GraphQL API.

## 🛠 Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (for the frontend)
*   [Python 3.x](https://www.python.org/) (for the backend)
*   [Docker](https://www.docker.com/) (recommended for local development and database management)

## 🚦 Getting Started

### 0. Database Setup

This project uses PostgreSQL managed via Docker. Before running the application, make sure you have the database running:

```bash
# Start the PostgreSQL service
docker compose up -d
```

The database must be healthy and running before you proceed with backend migrations.

### 1. Backend Setup

Navigate to the backend directory and set up your Python environment:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # ßOn Windows use `.venv\Scripts\activate`
pip install -r requirements.txt
```

Set up your environment variables:
```bash
cp .env.example .env
# Edit .env with your local credentials
```

Run migrations and start the server:
```bash
python manage.py migrate
python manage.py runserver
```

> [!TIP]
> **Permission Issues?** If you encounter permission errors or "command not found" when running `python` or `pip`, try using the absolute path to the virtual environment's Python binary:
> ```bash
> # Instead of 'python' or 'pip'
> ./backend/.venv/bin/python3 manage.py migrate
> ./backend/.venv/bin/python3 manage.py runserver
> ```

### 2. Frontend Setup

In a new terminal, navigate to the frontend directory:

```bash
cd frontend
pnpm install
```

Set up your environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your backend API URL
```

Start the designated development server:
```bash
pnpm dev
```

## 🤖 AI-Aware Project

This repository includes configuration files intended to assist AI coding tools (e.g., Cursor, Windsurf, GitHub Copilot).

*   `llms.txt`: Project context and structure overview.
*   `AGENTS.md`: Useful commands and instructions for AI agents.
