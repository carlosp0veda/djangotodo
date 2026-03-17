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
... (rest of the content)

## 🧪 Testing

### Frontend
Run unit tests for hooks and components:
```bash
cd frontend
pnpm test
```

### Backend
Run Django unit tests:
```bash
cd backend
python manage.py test
```

## 🤖 AI-Aware Project
...
