import { describe, it, expect } from "vitest";
import { parseBackendError } from "../errorParser";
import { ApiError } from "../errors";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type ErrorBody = Parameters<typeof parseBackendError>[0];

function makeError(
  overrides: Partial<ErrorBody> = {},
  statusCode = 400,
  fallback?: string,
) {
  return parseBackendError(
    { isSuccess: false, message: undefined, errors: undefined, ...overrides },
    statusCode,
    fallback,
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("parseBackendError", () => {
  it("returns a typed ApiError", () => {
    const err = makeError({ message: "فشل" });
    expect(err).toBeInstanceOf(ApiError);
  });

  it("uses the body.message when no field errors exist", () => {
    const err = makeError({ message: "Something went wrong" });
    expect(err.message).toBe("Something went wrong");
    expect(err.statusCode).toBe(400);
    expect(err.errors).toBeUndefined();
    expect(err.fieldErrors).toBeUndefined();
  });

  it("joins multiple flat messages with |", () => {
    const err = makeError({
      errors: [
        { messages: ["First error"] },
        { messages: ["Second error"] },
      ],
    });
    expect(err.message).toBe("First error | Second error");
    expect(err.errors).toEqual(["First error", "Second error"]);
  });

  it("builds fieldErrors keyed by field name", () => {
    const err = makeError({
      errors: [
        { field: "Email", messages: ["Invalid email"] },
        { field: "PhoneNumber", messages: ["Required"] },
      ],
    });
    expect(err.fieldErrors).toEqual({
      Email: "Invalid email",
      PhoneNumber: "Required",
    });
    expect(err.message).toBe("Invalid email | Required");
  });

  it("skips field entries with no messages array", () => {
    const err = makeError({
      errors: [
        { field: "Email", messages: [] },
        { field: "Name", messages: ["Required"] },
      ],
    });
    expect(err.fieldErrors).toEqual({ Name: "Required" });
    expect(err.message).toBe("Required");
  });

  it("uses fallbackMessage when body has no message and no errors", () => {
    const err = makeError({}, 500, "Custom fallback");
    expect(err.message).toBe("Custom fallback");
  });

  it("uses fallbackMessage when body.message is undefined and errors empty", () => {
    const err = makeError(
      { message: undefined, errors: [] },
      503,
      "Service unavailable",
    );
    expect(err.message).toBe("Service unavailable");
  });

  it("prefers flatMessages over body.message when both exist", () => {
    const err = makeError({
      message: "Generic error",
      errors: [{ messages: ["Specific error"] }],
    });
    expect(err.message).toBe("Specific error");
  });

  it("handles empty errors array", () => {
    const err = makeError({ errors: [] }, 400);
    expect(err.message).toBe("حدث خطأ غير متوقع");
    expect(err.errors).toBeUndefined();
    expect(err.fieldErrors).toBeUndefined();
  });

  it("handles missing errors field entirely", () => {
    const err = makeError({ errors: undefined }, 400);
    expect(err.message).toBe("حدث خطأ غير متوقع");
    expect(err.errors).toBeUndefined();
    expect(err.fieldErrors).toBeUndefined();
  });

  it("handles a field entry with a message but never sets fieldErrors if field is missing", () => {
    // Regression: field entry with message but no field name
    const err = makeError({
      errors: [{ messages: ["Orphan message"] }],
    });
    expect(err.message).toBe("Orphan message");
    expect(err.errors).toEqual(["Orphan message"]);
    expect(err.fieldErrors).toBeUndefined();
  });

  it("passes statusCode through correctly", () => {
    expect(makeError({ message: "x" }, 400).statusCode).toBe(400);
    expect(makeError({ message: "x" }, 401).statusCode).toBe(401);
    expect(makeError({ message: "x" }, 403).statusCode).toBe(403);
    expect(makeError({ message: "x" }, 404).statusCode).toBe(404);
    expect(makeError({ message: "x" }, 500).statusCode).toBe(500);
  });
});
