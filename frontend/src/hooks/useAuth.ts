"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const getCsrfToken = () => Cookies.get("csrftoken") || "";

export function useAuth(initialIsAuthenticated?: boolean) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: isAuthenticated } = useQuery({
        queryKey: ["auth-status"],
        queryFn: () => !!Cookies.get("is_logged_in"),
        initialData: typeof window === "undefined"
            ? initialIsAuthenticated
            : !!Cookies.get("is_logged_in"),
        staleTime: Infinity,
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials: Record<string, string>) => {
            const response = await fetch("/api/token/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCsrfToken()
                },
                body: JSON.stringify(credentials),
                credentials: "include",
            });

            if (!response.ok) throw new Error("Login failed");
            return response.json();
        },
        onSuccess: () => {
            Cookies.set("is_logged_in", "true", { expires: 7 });

            queryClient.setQueryData(["auth-status"], true);
            queryClient.invalidateQueries();
            if (typeof window !== "undefined") {
                window.location.href = "/";
            }
        },
    });

    const registerMutation = useMutation({
        mutationFn: async (userData: Record<string, string>) => {
            const response = await fetch("/api/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCsrfToken()
                },
                body: JSON.stringify(userData),
                credentials: "include",
            });

            if (!response.ok) {
                let errorMessage = "Registration failed";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.detail || errorMessage;
                } catch (parseError) {
                    console.error("Backend crashed and returned HTML. Check Django terminal!");
                    errorMessage = `Server Error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }
            return response.json();
        },
        onSuccess: () => {
            Cookies.set("is_logged_in", "true", { expires: 7 });
            queryClient.setQueryData(["auth-status"], true);
            queryClient.invalidateQueries();
            router.refresh();
        },
    });

    const logout = async () => {
        try {
            await fetch("/api/logout/", {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCsrfToken()
                },
                credentials: "include",
            });
        } catch (error) {
            console.error("Failed to hit logout endpoint", error);
        } finally {
            Cookies.remove("is_logged_in");
            queryClient.clear();
            queryClient.setQueryData(["auth-status"], false);
            router.refresh();
        }
    };

    return {
        isAuthenticated,
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        isLoading: loginMutation.isPending || registerMutation.isPending,
        error: loginMutation.error || registerMutation.error,
        logout,
    };
}