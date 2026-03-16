# Architecture Overview

This document outlines the high-level architecture of the DjangoTodo application, focusing on system integration, core design patterns, and security.

## Unified System Architecture

A decoupled full-stack architecture designed for scalability and clear separation of concerns.

```mermaid
graph LR
    User([End User])
    Next["Next.js Application<br/>(Frontend/Server-side)"]
    Django["Django Business API<br/>(Core Logic)"]
    DB[("PostgreSQL<br/>(Persistence)")]

    User -- "HTTPS / UI Interaction" --> Next
    Next -- "RESTful API Proxy" --> Django
    Django -- "Django ORM" --> DB

    style Next fill:#f9f9f9,stroke:#333
    style Django fill:#f9f9f9,stroke:#333
    style DB fill:#e1f5fe,stroke:#01579b
```

---

## Backend Engine & Data Strategy

The backend follows the **Services/Selectors** pattern to decouple business logic from API views.

```mermaid
graph TB
    subgraph Logic["Business Logic Layer"]
        Services["Services (Write Operations)<br/>Transactional consistency"]
        Selectors["Selectors (Read Operations)<br/>Optimized queries"]
    end

    subgraph Data["Data Layer"]
        Models["Django Models<br/>(User, Todo, Category)"]
        Schema[("PostgreSQL Storage")]
    end

    API["REST API Layer<br/>(DRF Views)"] --> Services
    API --> Selectors
    Services --> Models
    Selectors --> Models
    Models --> Schema
```

---

## Frontend & State Architecture

Modern React architecture utilizing Server Components for initial load and Hooks for interactive state.

```mermaid
graph TD
    subgraph Components["Visual Layer"]
        Pages["App Router Pages"]
        UI["Atomic UI Components"]
    end

    subgraph State["State Management"]
        RQ["React Query<br/>(Server State Cache)"]
        Zustand["Zustand<br/>(Local UI State)"]
    end

    subgraph Integration["Network Layer"]
        Fetch["apiFetch Utility"]
    end

    Pages --> UI
    Pages --> State
    State --> Fetch
    Fetch -- "Bearer Token Proxy" --> API["Django API"]
```

---

## Security Framework

Authentication is handled via JSON Web Tokens (JWT) with secure cookie persistence.

```mermaid
sequenceDiagram
    participant U as User
    participant F as Next.js Frontend
    participant B as Django Backend

    U->>F: Register / Login
    F->>B: POST /api/token (Credentials)
    B-->>F: JWT (Access & Refresh)
    F->>F: Set HttpOnly Cookies
    Note over F,B: Future requests automatically attach JWT
```

---

## Infrastructure

The local environment is containerized for consistency across development stages.

| Service    | Tech Stack  | Role                                      | Port |
| ---------- | ----------- | ----------------------------------------- | ---- |
| **Frontend** | Next.js 15  | Rendering, Routing, UI Logic              | 3000 |
| **Backend**  | Django 5    | Identity, Business Rules, REST API        | 8000 |
| **Database** | PostgreSQL  | Relational Persistence                    | 5432 |

### Local Commands
- **Frontend**: `npm run dev` (in `/frontend`)
- **Backend**: `python manage.py runserver` (in `/backend`)
- **Database**: `docker compose up -d`
