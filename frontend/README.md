# Next.js Todo Frontend

This is the frontend component of the Django Todo application, built with **Next.js 16**, **React 19**, and **CSS Modules**.

## Features

- **Next.js App Router**: Modern, robust routing capabilities.
- **CSS Modules**: Scoped and modular styling for components.
- **React Query (TanStack Query)**: Powerful asynchronous state management for data fetching and mutations.
- **Zustand**: Lightweight and scalable global state management for UI-only state.
- **React 19**: Utilizing the latest React features and concurrent rendering.
- **React Compiler**: Enabled via `babel-plugin-react-compiler`.
- **TypeScript**: Configured with strict typings for safer code.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- Package Manager: `pnpm`.

## Getting Started

### 1. Install Dependencies

Navigate to the frontend directory and install the necessary dependencies:

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file by copying the provided example:

```bash
cp .env.example .env.local
```

Update the `DJANGO_API_URL` to point to your backend API. For local development, this is typically `http://127.0.0.1:8000/api`. Client components should now fetch from `/api` which will be securely proxied.

### 3. Running the Development Server

Start the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The page will auto-update as you edit files in the `src/` directory.

## Project Structure

- `src/app/`: The Next.js App Router endpoints and primary entry points.
- `public/`: Static assets like images, fonts, and icons.

## Build for Production

To create an optimized production build:

```bash
pnpm build
```

Then you can run the built app with:

```bash
pnpm start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [React Query Documentation](https://tanstack.com/query/latest/docs/framework/react/overview) - learn about TanStack Query.
- [Zustand Documentation](https://zustand-demo.pmnd.rs/) - learn about Zustand state management.
- [CSS Modules Guide](https://github.com/css-modules/css-modules) - learn about CSS Modules.
