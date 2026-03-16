"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { TokenResponse } from "../lib/types";

export function useAuth(initialIsAuthenticated?: boolean) {
    const queryClient = useQueryClient();
    const router = useRouter();

    // 1. Use a Query for the auth status instead of manual state
    // This makes the 'isAuthenticated' status available globally and cacheable
    const { data: isAuthenticated } = useQuery({
        queryKey: ["auth-status"],
        queryFn: () => !!Cookies.get("access_token"),
        initialData: typeof window === "undefined"
            ? initialIsAuthenticated
            : !!Cookies.get("access_token"),
        staleTime: Infinity, // Trust the manual cache updates and cookie Fn
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials: Record<string, string>) => {
            const response = await fetch("/api/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });
            if (!response.ok) throw new Error("Login failed");
            return response.json() as Promise<TokenResponse>;
        },
        onSuccess: (data) => {
            Cookies.set("access_token", data.access, { expires: 1 });
            Cookies.set("refresh_token", data.refresh, { expires: 7 });

            // 2. Synchronously update the cache 
            queryClient.setQueryData(["auth-status"], true);

            // 3. Invalidate to trigger any dependent UI fetches
            queryClient.invalidateQueries();

            // 4. Refresh to trigger server component re-render
            router.refresh();
        },
    });

    const registerMutation = useMutation({
        mutationFn: async (userData: Record<string, string>) => {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Registration failed");
            }
            return response.json();
        },
        onSuccess: (_, variables) => {
            // Auto-login after registration
            loginMutation.mutate({
                email: variables.email,
                password: variables.password,
            });
        },
    });

    const logout = () => {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        queryClient.clear();
        queryClient.setQueryData(["auth-status"], false);
        router.refresh();
    };

    return {
        isAuthenticated,
        login: loginMutation.mutate,
        register: registerMutation.mutate,
        isLoading: loginMutation.isPending || registerMutation.isPending,
        error: loginMutation.error || registerMutation.error,
        logout,
    };
}