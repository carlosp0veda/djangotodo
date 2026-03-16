import { Category, Todo, TodoInput } from "./types";
import Cookies from "js-cookie";

// Helper function to get the current access token
const getAccessToken = () => {
    return Cookies.get("access_token") || null;
};

// Centralized API handler
export const apiFetch = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const token = getAccessToken();
    const headers = new Headers(options.headers || {});

    headers.set("Content-Type", "application/json");
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers,
    });

    // Handle 401 Unauthorized - attempt token refresh
    if (response.status === 401) {
        const refreshToken = Cookies.get("refresh_token");
        
        if (refreshToken) {
            try {
                // Attempt to refresh the token
                const refreshResponse = await fetch("/api/token/refresh", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh: refreshToken }),
                });

                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    Cookies.set("access_token", data.access);
                    // SimpleJWT rotate token might return a new refresh token too
                    if (data.refresh) {
                        Cookies.set("refresh_token", data.refresh);
                    }

                    // Retry the original request with the new token
                    headers.set("Authorization", `Bearer ${data.access}`);
                    const retryResponse = await fetch(`/api${endpoint}`, {
                        ...options,
                        headers,
                    });

                    if (retryResponse.ok) {
                        if (retryResponse.status === 204) return {} as T;
                        return retryResponse.json();
                    }
                }
            } catch (error) {
                console.error("Token refresh failed:", error);
            }
        }

        // If refresh fails or no refresh token, log out
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        if (typeof window !== "undefined") {
            window.location.reload();
        }
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `API Error: ${response.statusText}`);
    }

    // Handle 204 No Content
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
