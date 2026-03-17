import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TodoApp from '../TodoApp';
import { server } from '@/test/setup-tests';
import { http, HttpResponse } from 'msw';
import Cookies from 'js-cookie';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTodoStore } from "../../../store/useTodoStore";

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}));
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            gcTime: 0,
        },
    },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = createTestQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

const BASE_URL = 'http://localhost:3000';

describe('TodoApp Integration', () => {
    beforeEach(() => {
        // Set up authentication cookie
        Cookies.set('is_logged_in', 'true');
    });

    afterEach(() => {
        server.resetHandlers();
        vi.clearAllMocks();
        Cookies.remove('is_logged_in');
    });

    it('renders loading state initially and then shows todos', async () => {
        render(
            <TestWrapper>
                <TodoApp />
            </TestWrapper>
        );

        expect(screen.getByText(/loading tasks.../i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Sample Todo')).toBeInTheDocument();
        }, { timeout: 4000 });
    });

    it('shows error banner when API fails', async () => {
        server.use(
            http.get(`${BASE_URL}/api/todos`, () => {
                return HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 });
            })
        );

        render(
            <TestWrapper>
                <TodoApp />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText(/Internal Server Error/i)).toBeInTheDocument();
        }, { timeout: 4000 });
    });

    it('successfully handles category creation', async () => {
        server.use(
            http.post(`${BASE_URL}/api/categories`, () => {
                return HttpResponse.json({ id: '123', name: 'Work Tasks', color: '#00ff00' }, { status: 201 });
            })
        );

        const store = useTodoStore.getState();
        store.setIsCreatingCategory(true);
        store.setNewCategoryName('Work Tasks');

        render(
            <TestWrapper>
                <TodoApp />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.queryByText(/loading tasks.../i)).not.toBeInTheDocument();
        });
        const submitBtn = screen.getByRole('button', { name: /create/i });
        fireEvent.click(submitBtn);
        await waitFor(() => {
            expect(useTodoStore.getState().isCreatingCategory).toBe(false);
        });
    });

    it('shows empty state when no todos are returned', async () => {
        server.use(
            http.get(`${BASE_URL}/api/todos`, () => {
                return HttpResponse.json([]);
            })
        );

        render(
            <TestWrapper>
                <TodoApp />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText(/charming notes/i)).toBeInTheDocument();
        }, { timeout: 4000 });
    });
});
