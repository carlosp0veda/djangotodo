import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { todosApi, categoriesApi } from "../lib/api";
import { Todo, TodoInput } from "@/types";

// Queries
export function useTodosQuery(categoryId?: number | null) {
    return useQuery({
        queryKey: ["todos", categoryId],
        queryFn: () => todosApi.list(categoryId || undefined),
    });
}

export function useCategoriesQuery() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: categoriesApi.list,
    });
}

// Mutations
export function useAddTodoMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (todo: TodoInput) => todosApi.create(todo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });
}

export function useUpdateTodoMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<TodoInput> }) => todosApi.update(id, data),
        onMutate: async (newTodo) => {
            // Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ["todos"] });

            // Snapshot the previous value
            const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

            // Optimistically update to the new value (this is a bit tricky if we have active category filters, but we invalidate afterwards anyway)
            queryClient.setQueriesData({ queryKey: ["todos"] }, (old: Todo[] | undefined) => {
                if (!old) return old;
                return old.map(t => t.id === newTodo.id ? { ...t, ...newTodo.data } : t);
            });

            return { previousTodos };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueriesData({ queryKey: ["todos"] }, context?.previousTodos);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        }
    });
}

export function useDeleteTodoMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => todosApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });
}

export function useAddCategoryMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (category: { name: string; color?: string }) => categoriesApi.create(category),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
}
