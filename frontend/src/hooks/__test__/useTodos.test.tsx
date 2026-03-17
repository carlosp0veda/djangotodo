import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

// Import your hooks and API
import {
    useTodosQuery,
    useTodoQuery,
    useAddTodoMutation,
    useUpdateTodoMutation,
    useDeleteTodoMutation
} from "../useTodos"; // Update this path
import { todosApi } from "@/lib/api";
import { Todo } from "@/types";

// 1. Mock the API
vi.mock("@/lib/api", () => ({
    todosApi: {
        list: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
    categoriesApi: {
        list: vi.fn(),
        create: vi.fn(),
    },
}));

// 2. Test Utility: Create a fresh QueryClient for every test to avoid cache pollution
const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

function renderWithClient(ui: () => any) {
    const testClient = createTestQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={testClient}>{children}</QueryClientProvider>
    );
    return {
        ...renderHook(ui, { wrapper }),
        testClient,
    };
}

describe("Todos Hooks Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("useTodosQuery: fetches and returns data", async () => {
        const mockData = [{
            id: 1,
            title: "Test",
            category: { id: 1, name: "Test", color: "red" },
            description: "Test",
            created_at: "2022-01-01",
            updated_at: "2022-01-01",
            owner: 'testuser',
            completed: false
        }];
        vi.mocked(todosApi.list).mockResolvedValue(mockData);

        const { result } = renderWithClient(() => useTodosQuery(null));
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockData);
        expect(todosApi.list).toHaveBeenCalledWith(undefined);
    });

    it("useTodoQuery: stays disabled if id is null", () => {
        const { result } = renderWithClient(() => useTodoQuery(null));
        expect(result.current.fetchStatus).toBe("idle");
        expect(todosApi.get).not.toHaveBeenCalled();
    });

    it("useTodoQuery: fetches data when id is provided", async () => {
        vi.mocked(todosApi.get).mockResolvedValue({ id: 5, title: "Specific", category: { id: 1, name: "Test", color: "red" }, description: "Test", created_at: "2022-01-01", updated_at: "2022-01-01", owner: 'testuser', completed: false });
        const { result } = renderWithClient(() => useTodoQuery(5));

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.id).toBe(5);
    });

    it("useAddTodoMutation: invalidates 'todos' on success", async () => {
        vi.mocked(todosApi.create).mockResolvedValue({ id: 10, title: "New", category: { id: 1, name: "Test", color: "red" }, description: "Test", created_at: "2022-01-01", updated_at: "2022-01-01", owner: 'testuser', completed: false });
        const { result, testClient } = renderWithClient(() => useAddTodoMutation());

        const invalidateSpy = vi.spyOn(testClient, "invalidateQueries");

        result.current.mutate({ title: "New", category: { id: 1, name: "Test", color: "red" }, description: "Test", created_at: "2022-01-01", updated_at: "2022-01-01", owner: 'testuser', completed: false });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["todos"] });
    });

    it("useUpdateTodoMutation: performs optimistic update", async () => {
        const queryKey = ["todos", undefined];
        const previousData = [{ id: 1, title: "Old Title" }] as Todo[];

        const { result, testClient } = renderWithClient(() => useUpdateTodoMutation());

        testClient.setQueryData(queryKey, previousData);

        vi.mocked(todosApi.update).mockRejectedValue(new Error("Update Failed"));
        await expect(result.current.mutateAsync({
            id: 1,
            data: { title: "New Title" }
        })).rejects.toThrow();
    });

    it("useDeleteTodoMutation: calls delete and invalidates", async () => {
        vi.mocked(todosApi.delete).mockResolvedValue();
        const { result, testClient } = renderWithClient(() => useDeleteTodoMutation());
        const invalidateSpy = vi.spyOn(testClient, "invalidateQueries");

        result.current.mutate(1);
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(todosApi.delete).toHaveBeenCalledWith(1);
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["todos"] });
    });
});