import { Category, Todo, TodoInput } from "@/types";
import Cookies from "js-cookie";

const getCsrfToken = () => {
    return Cookies.get("csrftoken") || "";
};

// --- Concurrency Lock Variables ---
let isRefreshing = false;
// A queue of promises waiting for the refresh to complete
let refreshSubscribers: Array<(error: Error | null) => void> = [];

// Helper to resolve or reject all waiting requests
const onRefreshed = (error: Error | null) => {
    refreshSubscribers.forEach((callback) => callback(error));
    refreshSubscribers = [];
};
// ----------------------------------

export const apiFetch = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");

    const method = options.method?.toUpperCase() || "GET";
    if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) {
        const csrfToken = getCsrfToken();
        if (csrfToken) headers.set("X-CSRFToken", csrfToken);
    }

    const fetchOptions: RequestInit = {
        ...options,
        headers,
        credentials: "include",
    };

    const response = await fetch(`/api${endpoint}`, fetchOptions);

    if (response.status === 401) {
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const refreshResponse = await fetch("/api/token/refresh/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCsrfToken(),
                    },
                    credentials: "include",
                });

                if (!refreshResponse.ok) {
                    throw new Error("Session expired");
                }

                onRefreshed(null);

                return apiFetch<T>(endpoint, options);

            } catch (error) {
                console.error("Token refresh failed:", error);

                onRefreshed(error as Error);

                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                throw error;
            } finally {
                isRefreshing = false;
            }
        } else {
            return new Promise((resolve, reject) => {
                refreshSubscribers.push((error) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(apiFetch<T>(endpoint, options));
                });
            });
        }
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `API Error: ${response.statusText}`);
    }

    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
};

export const todosApi = {
    list: (categoryId?: number) => {
        const query = categoryId ? `?category_id=${categoryId}` : "";
        return apiFetch<Todo[]>(`/todos${query}`);
    },
    create: (todo: TodoInput) =>
        apiFetch<Todo>("/todos", {
            method: "POST",
            body: JSON.stringify(todo),
        }),
    update: (id: number, todo: Partial<TodoInput>) =>
        apiFetch<Todo>(`/todos/${id}`, {
            method: "PUT",
            body: JSON.stringify(todo),
        }),
    get: (id: number) => apiFetch<Todo>(`/todos/${id}`),
    delete: (id: number) =>
        apiFetch<void>(`/todos/${id}`, {
            method: "DELETE",
        }),
};

export const categoriesApi = {
    list: () => apiFetch<Category[]>("/categories"),
    create: (category: { name: string; color?: string }) =>
        apiFetch<Category>("/categories", {
            method: "POST",
            body: JSON.stringify(category),
        }),
};