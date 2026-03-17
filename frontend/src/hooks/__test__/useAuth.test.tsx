import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useAuth } from "../useAuth";

vi.mock("js-cookie", () => ({
  default: { get: vi.fn(), set: vi.fn(), remove: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("useAuth hook", () => {
  let queryClient: QueryClient;
  let mockRefresh: ReturnType<typeof vi.fn>;
  let mockFetch: ReturnType<typeof vi.fn>;

  const createWrapper = () => {
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = vi.fn();
    global.fetch = mockFetch as unknown as typeof fetch;
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockRefresh = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ refresh: mockRefresh } as unknown as ReturnType<typeof useRouter>);

    Object.defineProperty(window, "location", {
      value: { href: "http://localhost/" },
      writable: true,
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe("Initialization", () => {
    it("is authenticated if cookie is present", async () => {
      (vi.mocked(Cookies.get) as any).mockImplementation((key: string) => {
        if (key === "is_logged_in") return "true";
        return undefined;
      });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
    });
  });

  describe("Login Mutation", () => {
    it("handles successful login and redirects", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "123" }),
      } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      act(() => {
        result.current.login({ username: "test", password: "password" });
      });

      await waitFor(() => {
        expect(Cookies.set).toHaveBeenCalledWith("is_logged_in", "true", { expires: 7 });
        expect(window.location.href).toBe("/");
      });
    });

    it("throws an error on failed login", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await expect(
        result.current.login({ username: "test", password: "wrong" })
      ).rejects.toThrow("Login failed");
    });
  });

  describe("Register Mutation", () => {
    it("handles successful registration and refreshes router", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      act(() => {
        result.current.register({ email: "test@test.com", password: "password" });
      });

      await waitFor(() => {
        expect(Cookies.set).toHaveBeenCalledWith("is_logged_in", "true", { expires: 7 });
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it("parses backend JSON errors correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Email already exists" }),
      } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await expect(
        result.current.register({ email: "test@test.com", password: "password" })
      ).rejects.toThrow("Email already exists");
    });

    it("falls back to generic error message if backend returns HTML (crashes)", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: "Bad Gateway",
        json: async () => { throw new Error("Unexpected token < in JSON"); },
      } as unknown as Response);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await expect(
        result.current.register({ email: "test@test.com", password: "password" })
      ).rejects.toThrow("Server Error: 502 Bad Gateway");

      expect(consoleSpy).toHaveBeenCalledWith("Backend crashed and returned HTML. Check Django terminal!");
      consoleSpy.mockRestore();
    });
  });

  describe("Logout", () => {
    it("calls the logout endpoint and clears state", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.logout();
      });

      expect(fetch).toHaveBeenCalledWith("/api/logout/", expect.any(Object));
      expect(Cookies.remove).toHaveBeenCalledWith("is_logged_in");
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("clears state even if the logout endpoint fails (finally block)", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });
      mockFetch.mockRejectedValueOnce(new Error("Network disconnect"));

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.logout();
      });

      expect(Cookies.remove).toHaveBeenCalledWith("is_logged_in");
      expect(mockRefresh).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});