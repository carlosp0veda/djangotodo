import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './msw/handlers';

const BASE_URL = 'http://localhost:3000';

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'location', {
        value: new URL(BASE_URL),
        writable: true,
    });
}

const originalFetch = global.fetch;
global.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string' && input.startsWith('/')) {
        return originalFetch(`${BASE_URL}${input}`, init);
    }
    return originalFetch(input, init);
};

vi.mock('next/image', () => ({
    __esModule: true,
    default: (props: { alt?: string }) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} alt={props.alt || ''} />;
    },
}));

vi.mock('next/font/google', () => ({
    Inter: () => ({ variable: 'var(--font-inter)' }),
    Inria_Serif: () => ({ variable: 'var(--font-inria)' }),
}));

export const server = setupServer(...handlers);

beforeAll(() => {
    server.listen({
        onUnhandledRequest: (req) => {
            if (req.url.includes('/api/')) {
                console.error(`[MSW] LEAK! Unhandled request ${req.method} ${req.url}`);
            }
        },
    });
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
