import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "../useAuthStore";
import type { AuthData } from "@/lib/apiServices";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockLoginApi = vi.fn();
const mockRegisterOrgApi = vi.fn();
const mockPersistTokens = vi.fn();
const mockClearTokens = vi.fn();
const mockCookieGet = vi.fn();
const mockCookieRemove = vi.fn();

vi.mock("@/lib/apiServices", () => ({
  loginApi: (...args: unknown[]) => mockLoginApi(...args),
  registerOrganizationApi: (...args: unknown[]) => mockRegisterOrgApi(...args),
  persistTokens: (...args: unknown[]) => mockPersistTokens(...args),
  clearTokens: (...args: unknown[]) => mockClearTokens(...args),
}));

vi.mock("js-cookie", () => ({
  default: {
    get: (...args: unknown[]) => mockCookieGet(...args),
    remove: (...args: unknown[]) => mockCookieRemove(...args),
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a base64 JWT header + payload (no signature check). */
function buildJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

function makeAuthData(overrides: Partial<AuthData> = {}): AuthData {
  return {
    id: "user-1",
    message: "",
    email: "admin@sparko.com",
    userName: "admin",
    token: "mock-token",
    refreshToken: "mock-refresh",
    refreshTokenExpiration: "",
    isAuthenticated: true,
    roles: ["SuperAdmin"],
    errors: [],
    ...overrides,
  };
}

// ─── Reset State ─────────────────────────────────────────────────────────────

beforeEach(() => {
  // Reset zustand store to initial values
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  vi.clearAllMocks();
});

// ─── login ───────────────────────────────────────────────────────────────────

describe("login", () => {
  it("successfully logs in and persists tokens", async () => {
    const data = makeAuthData();
    mockLoginApi.mockResolvedValue(data);

    await useAuthStore.getState().login("admin@sparko.com", "pass");

    const state = useAuthStore.getState();
    expect(state.user).toEqual({
      id: "user-1",
      email: "admin@sparko.com",
      userName: "admin",
      roles: ["SuperAdmin"],
    });
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(mockPersistTokens).toHaveBeenCalledWith("mock-token", "mock-refresh");
  });

  it("sets embedded error when data.errors is non-empty", async () => {
    const data = makeAuthData({
      errors: ["Invalid credentials"],
      token: "",
      refreshToken: "",
      isAuthenticated: false,
    });
    mockLoginApi.mockResolvedValue(data);

    await expect(
      useAuthStore.getState().login("admin@sparko.com", "wrong"),
    ).rejects.toThrow("Invalid credentials");

    const state = useAuthStore.getState();
    expect(state.error).toBe("Invalid credentials");
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(mockPersistTokens).not.toHaveBeenCalled();
  });

  it("sets error and re-throws on API exception", async () => {
    mockLoginApi.mockRejectedValue(new Error("Network error"));

    await expect(
      useAuthStore.getState().login("admin@sparko.com", "pass"),
    ).rejects.toThrow("Network error");

    const state = useAuthStore.getState();
    expect(state.error).toBe("Network error");
    expect(state.isLoading).toBe(false);
    expect(mockPersistTokens).not.toHaveBeenCalled();
  });

  it("uses fallback message when error has no message", async () => {
    mockLoginApi.mockRejectedValue("Something that is not an Error");

    await expect(
      useAuthStore.getState().login("admin@sparko.com", "pass"),
    ).rejects.toBe("Something that is not an Error");

    const state = useAuthStore.getState();
    expect(state.error).toBe("فشل تسجيل الدخول");
  });

  it("sets isLoading true while request is in flight", async () => {
    let resolvePromise!: (value: AuthData) => void;
    mockLoginApi.mockReturnValue(
      new Promise<AuthData>((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const loginPromise = useAuthStore.getState().login("admin@sparko.com", "pass");
    // After the first tick, isLoading should be true
    await vi.waitFor(() => {
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    resolvePromise(makeAuthData());
    await loginPromise;

    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});

// ─── register ────────────────────────────────────────────────────────────────

describe("register", () => {
  it("successfully registers and persists tokens", async () => {
    const data = makeAuthData({ userName: "neworg", email: "org@test.com" });
    mockRegisterOrgApi.mockResolvedValue(data);

    await useAuthStore.getState().register(new FormData());

    const state = useAuthStore.getState();
    expect(state.user?.userName).toBe("neworg");
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(mockPersistTokens).toHaveBeenCalled();
  });

  it("handles 204 No Content (null data) by just clearing loading", async () => {
    mockRegisterOrgApi.mockResolvedValue(null);

    await useAuthStore.getState().register(new FormData());

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(mockPersistTokens).not.toHaveBeenCalled();
  });

  it("sets embedded error when data.errors is non-empty", async () => {
    const data = makeAuthData({
      errors: ["Organization already exists"],
      token: "",
      refreshToken: "",
      isAuthenticated: false,
    });
    mockRegisterOrgApi.mockResolvedValue(data);

    await expect(
      useAuthStore.getState().register(new FormData()),
    ).rejects.toThrow("Organization already exists");

    const state = useAuthStore.getState();
    expect(state.error).toBe("Organization already exists");
    expect(state.isLoading).toBe(false);
    expect(mockPersistTokens).not.toHaveBeenCalled();
  });

  it("sets error and re-throws on API exception", async () => {
    mockRegisterOrgApi.mockRejectedValue(new Error("Duplicate entry"));

    await expect(
      useAuthStore.getState().register(new FormData()),
    ).rejects.toThrow("Duplicate entry");

    const state = useAuthStore.getState();
    expect(state.error).toBe("Duplicate entry");
    expect(state.isLoading).toBe(false);
    expect(mockPersistTokens).not.toHaveBeenCalled();
  });
});

// ─── logout ──────────────────────────────────────────────────────────────────

describe("logout", () => {
  it("clears tokens and resets user state", () => {
    // Seed store with authenticated state
    useAuthStore.setState({
      user: { id: "1", email: "a@b.com", userName: "admin", roles: ["Admin"] },
      isAuthenticated: true,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
    expect(mockClearTokens).toHaveBeenCalledOnce();
  });
});

// ─── clearError ──────────────────────────────────────────────────────────────

describe("clearError", () => {
  it("resets error to null", () => {
    useAuthStore.setState({ error: "Something broke" });

    useAuthStore.getState().clearError();

    expect(useAuthStore.getState().error).toBeNull();
  });
});

// ─── hydrate ─────────────────────────────────────────────────────────────────

describe("hydrate", () => {
  it("decodes a valid JWT and sets authenticated user", () => {
    const jwt = buildJwt({
      sub: "u-42",
      email: "user@sparko.com",
      name: "Test User",
      roles: ["Admin"],
    });
    mockCookieGet.mockReturnValue(jwt);

    useAuthStore.getState().hydrate();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual({
      id: "u-42",
      email: "user@sparko.com",
      userName: "Test User",
      roles: ["Admin"],
    });
  });

  it("handles token with minimal payload (sub only)", () => {
    const jwt = buildJwt({ sub: "u-1" });
    mockCookieGet.mockReturnValue(jwt);

    useAuthStore.getState().hydrate();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual({
      id: "u-1",
      email: "",
      userName: "",
      roles: [],
    });
  });

  it("handles token with custom claim names (id, userName)", () => {
    const jwt = buildJwt({
      id: "custom-99",
      email: "c@test.com",
      userName: "custom",
      roles: ["User"],
    });
    mockCookieGet.mockReturnValue(jwt);

    useAuthStore.getState().hydrate();

    const state = useAuthStore.getState();
    expect(state.user?.id).toBe("custom-99");
    expect(state.user?.userName).toBe("custom");
  });

  it("does nothing when no token cookie exists", () => {
    mockCookieGet.mockReturnValue(undefined);

    useAuthStore.getState().hydrate();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("handles malformed JWT gracefully (user stays null)", () => {
    mockCookieGet.mockReturnValue("not-a-valid-jwt");

    useAuthStore.getState().hydrate();

    const state = useAuthStore.getState();
    // hydrate sets isAuthenticated=true if token exists, even if decode fails
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toBeNull();
  });
});
