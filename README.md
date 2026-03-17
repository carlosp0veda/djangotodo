# Project Structure

This is a modern full-stack web application.

## 🚀 Welcome

This project follows a decoupled architecture, separating the client-side user interface from the server-side API and database.

## 📂 Architecture Overview

For a detailed look at the system design and data flow, please see the [Architecture Overview](docs/architecture-overview.md).

The repository is organized into two main directories:

*   **`frontend/`**: Contains the client application built with Next.js 16, React 19, and TypeScript. Handles all UI, state management (Zustand), and data fetching (React Query).
*   **`backend/`**: Contains the server application (typically Django/Python). Manages business logic, database models, and provides the REST API.

## 🛠 Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (for the frontend)
*   [Python 3.x](https://www.python.org/) (for the backend)
*   [Docker](https://www.docker.com/) (recommended for local development and database management)

## 🚦 Getting Started

### 0. Full Stack Setup (Recommended)

The easiest way to run the entire application is using Docker Compose. This starts the database, backend, and frontend with a single command:

```bash
docker compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000/api/](http://localhost:8000/api/)
- **Database**: Port 5432

### 1. Database Only (Development)

If you prefer to run services locally for development:

```bash
# Start only the PostgreSQL service
docker compose up -d db
```

The database must be healthy and running before you proceed with backend migrations.

### 2. Backend Setup

If you prefer to run the Django backend locally:

```bash
cd backend

# 1. Create and activate virtual environment
python -m venv .venv # or python3 -m venv .venv
source .venv/bin/activate  # On Windows use `.venv\Scripts\activate`

# 2. Install dependencies
pip install -r requirements.txt # or pip3 install -r requirements.txt

# 3. Apply migrations
python manage.py migrate

# 4. Run the development server
python manage.py runserver
```

The API will be available at [http://localhost:8000/api/](http://localhost:8000/api/).

### 3. Frontend Setup

If you prefer to run the Next.js frontend locally:

```bash
cd frontend

# 1. Install dependencies
pnpm install

# 2. Run the development server
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🧪 Testing

We use a combination of unit, integration, and E2E tests to ensure quality.

- **Backend**: Django tests for API endpoints and business logic.
- **Frontend**: Vitest for components/hooks, and Playwright for full user flows.

### Quick Commands

- **All Frontend**: `cd frontend && pnpm test`
- **All Backend**: `cd backend && python manage.py test`
- **E2E Tests**: `cd frontend && pnpm e2e`

## 🤖 AI-Aware Project

This project is "AI-aware," meaning it includes specialized documentation and structures to help AI coding assistants (like Claude, Antigravity, or GitHub Copilot) understand the codebase more effectively.

- **[AGENTS.md](AGENTS.md)**: The core source of truth for AI agents. It contains the technology stack, project structure, coding standards, and common commands. If you are using an AI assistant, point it to this file first.
- **`.agents/`**: Contains specialized workflows and skills that AI agents can use to perform complex tasks like architectural reviews or security audits.

By maintaining these files, we ensure that AI-driven development is faster, safer, and more consistent with the project's architectural vision.
