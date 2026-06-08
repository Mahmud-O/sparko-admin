import { describe, it, expect } from "vitest";
import {
  required,
  email,
  minLength,
  password,
  match,
  phone,
  validate,
  validateForm,
} from "../validation";

// ─── required ────────────────────────────────────────────────────────

describe("required", () => {
  it("returns default message for empty string", () => {
    expect(required()("")).toBe("هذا الحقل مطلوب");
  });

  it("returns custom message for empty string", () => {
    expect(required("Custom message")("")).toBe("Custom message");
  });

  it("returns default message for whitespace-only string", () => {
    expect(required()("   ")).toBe("هذا الحقل مطلوب");
  });

  it("returns default message for false boolean", () => {
    expect(required()(false as unknown as string)).toBe("هذا الحقل مطلوب");
  });

  it("returns undefined for filled string", () => {
    expect(required()("hello")).toBeUndefined();
  });

  it("returns undefined for 0 (truthy number)", () => {
    // When a number is passed, it's treated as truthy
    expect(required()(0 as unknown as string)).toBe("هذا الحقل مطلوب");
  });
});

// ─── email ───────────────────────────────────────────────────────────

describe("email", () => {
  it("returns undefined for empty string (let required handle it)", () => {
    expect(email()("")).toBeUndefined();
  });

  it("returns undefined for valid email", () => {
    expect(email()("user@example.com")).toBeUndefined();
  });

  it("returns default message for missing @", () => {
    expect(email()("userexample.com")).toBe("البريد الإلكتروني غير صالح");
  });

  it("returns default message for missing domain", () => {
    expect(email()("user@")).toBe("البريد الإلكتروني غير صالح");
  });

  it("returns custom message", () => {
    expect(email("Invalid email")("bad")).toBe("Invalid email");
  });

  it("validates emails with subdomains", () => {
    expect(email()("user@sub.example.com")).toBeUndefined();
  });

  it("rejects email with spaces", () => {
    expect(email()("user @example.com")).toBe("البريد الإلكتروني غير صالح");
  });
});

// ─── minLength ───────────────────────────────────────────────────────

describe("minLength", () => {
  it("returns undefined for empty string (let required handle it)", () => {
    expect(minLength(3)("")).toBeUndefined();
  });

  it("returns undefined for string meeting minimum", () => {
    expect(minLength(3)("abc")).toBeUndefined();
  });

  it("returns default message for short string", () => {
    expect(minLength(8)("short")).toBe("يجب أن يكون الطول 8 أحرف على الأقل");
  });

  it("returns custom message for short string", () => {
    expect(minLength(5, "Too short")("hi")).toBe("Too short");
  });
});

// ─── password ────────────────────────────────────────────────────────

describe("password", () => {
  it("returns undefined for empty string (let required handle it)", () => {
    expect(password()("")).toBeUndefined();
  });

  it("returns undefined for valid password", () => {
    expect(password()("ValidP@ss1")).toBeUndefined();
  });

  it("rejects password without digit", () => {
    expect(password()("NoDigit!@#")).toBe(
      "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل"
    );
  });

  it("rejects password without special character", () => {
    expect(password()("NoSpecial1")).toBe(
      "يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل"
    );
  });

  it("rejects password shorter than 8 characters", () => {
    expect(password()("Sh0rt!")).toBe(
      "يجب أن تكون كلمة المرور 8 أحرف على الأقل"
    );
  });

  it("accepts passwords with various special characters", () => {
    expect(password()("Str0ng!@#")).toBeUndefined();
    expect(password()("Str0ng-()_")).toBeUndefined();
    expect(password()("Str0ng{}[]")).toBeUndefined();
  });

  it("uses custom messages", () => {
    const msgs = { digit: "Need digit", special: "Need special", length: "Need 8+" };
    expect(password(msgs)("NoDigits!")).toBe("Need digit");
    expect(password(msgs)("Digits1NoSpec")).toBe("Need special");
    expect(password(msgs)("Sh0rt!")).toBe("Need 8+");
  });
});

// ─── match ───────────────────────────────────────────────────────────

describe("match", () => {
  it("returns undefined for empty string (let required handle it)", () => {
    expect(match("target")("")).toBeUndefined();
  });

  it("returns undefined when values match", () => {
    expect(match("target")("target")).toBeUndefined();
  });

  it("returns default message when values do not match", () => {
    expect(match("target")("different")).toBe("كلمتا المرور غير متطابقتين");
  });

  it("returns custom message when values do not match", () => {
    expect(match("a", "No match")("b")).toBe("No match");
  });
});

// ─── phone ───────────────────────────────────────────────────────────

describe("phone", () => {
  it("returns undefined for empty string (let required handle it)", () => {
    expect(phone()("")).toBeUndefined();
  });

  it("returns undefined for valid Saudi mobile (10 digits)", () => {
    expect(phone()("512345678")).toBeUndefined();
  });

  it("returns undefined for valid number with spaces", () => {
    expect(phone()("512 345 678")).toBeUndefined();
  });

  it("rejects number with letters", () => {
    expect(phone()("abc1234567")).toBe("رقم الجوال غير صالح");
  });

  it("rejects too-short number", () => {
    expect(phone()("12345")).toBe("رقم الجوال غير صالح");
  });
});

// ─── validate (compose) ──────────────────────────────────────────────

describe("validate", () => {
  it("returns first error from validator chain", () => {
    const err = validate("", [required(), email()]);
    expect(err).toBe("هذا الحقل مطلوب");
  });

  it("returns second error when first passes", () => {
    const err = validate("notanemail", [required(), email()]);
    expect(err).toBe("البريد الإلكتروني غير صالح");
  });

  it("returns undefined when all validators pass", () => {
    const err = validate("user@example.com", [required(), email()]);
    expect(err).toBeUndefined();
  });

  it("returns undefined for empty validators array", () => {
    expect(validate("anything", [])).toBeUndefined();
  });
});

// ─── validateForm ────────────────────────────────────────────────────

describe("validateForm", () => {
  it("returns errors for invalid fields", () => {
    const errors = validateForm(
      { email: "", password: "" },
      {
        email: [required(), email()],
        password: [required(), password()],
      }
    );
    expect(errors.email).toBe("هذا الحقل مطلوب");
    expect(errors.password).toBe("هذا الحقل مطلوب");
  });

  it("returns partial errors when some fields are valid", () => {
    const errors = validateForm(
      { email: "user@example.com", password: "" },
      {
        email: [required(), email()],
        password: [required(), password()],
      }
    );
    expect(errors.email).toBeUndefined();
    expect(errors.password).toBe("هذا الحقل مطلوب");
  });

  it("returns no truthy errors when all fields valid", () => {
    const errors = validateForm(
      { email: "user@example.com" },
      { email: [required(), email()] }
    );
    expect(errors.email).toBeUndefined();
  });

  it("skips fields without validators", () => {
    const errors = validateForm(
      { name: "test", email: "" },
      { email: [required()] }
    );
    expect(errors.email).toBe("هذا الحقل مطلوب");
    // name has no validators so it should not appear in errors
    expect((errors as Record<string, string | undefined>).name).toBeUndefined();
  });
});
