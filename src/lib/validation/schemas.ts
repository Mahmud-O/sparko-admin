import * as yup from 'yup';
import type { ValidationError } from 'yup';

// ─── Shared helpers ───────────────────────────────────────────────────────────

const arabicMessages = {
  required: 'هذا الحقل مطلوب',
  email: 'البريد الإلكتروني غير صالح',
  phone: 'رقم الجوال غير صالح',
  min: (n: number) => `يجب أن يكون الطول ${n} أحرف على الأقل`,
  passwordDigit: 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل',
  passwordSpecial: 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل',
  passwordLength: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
  passwordMatch: 'كلمتا المرور غير متطابقتين',
  loginPasswordMin: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
  adminNamePattern: 'يجب أن يحتوي اسم المسؤول على أحرف وأرقام فقط (بدون مسافات)',
  termsAgreement: 'يجب الموافقة على اتفاقية الاستخدام',
  emptySelect: (label: string) => `يرجى اختيار ${label}`,
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = yup.object({
  identifier: yup
    .string()
    .required(arabicMessages.required),
  password: yup
    .string()
    .required('كلمة المرور مطلوبة')
    .min(6, arabicMessages.loginPasswordMin),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;

// ─── Register ─────────────────────────────────────────────────────────────────

const passwordTest = (value: string | undefined) => {
  if (!value) return false;
  if (!/\d/.test(value)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(value)) return false;
  if (value.length < 8) return false;
  return true;
};

export const registerSchema = yup.object({
  name: yup.string().required(arabicMessages.required),
  type: yup.string().required(arabicMessages.emptySelect('نوع الجهة')),
  sector: yup.string().required(arabicMessages.emptySelect('القطاع')),
  city: yup.string().required(arabicMessages.emptySelect('المدينة')),
  adminName: yup
    .string()
    .required(arabicMessages.required)
    .matches(/^[\p{L}0-9]+$/u, arabicMessages.adminNamePattern),
  adminNationalId: yup
    .string()
    .required(arabicMessages.required)
    .matches(/^[12][0-9]{9}$/, 'رقم الهوية الوطنية أو الإقامة يجب أن يتكون من 10 أرقام ويبدأ بـ 1 أو 2'),
  phone: yup
    .string()
    .required(arabicMessages.required)
    .matches(/^[0-9]{7,15}$/, arabicMessages.phone),
  email: yup
    .string()
    .required(arabicMessages.required)
    .email(arabicMessages.email),
  password: yup
    .string()
    .required(arabicMessages.required)
    .test('has-digit', arabicMessages.passwordDigit, passwordTest)
    .test('has-special', arabicMessages.passwordSpecial, passwordTest)
    .test('min-length', arabicMessages.passwordLength, passwordTest),
  confirmPassword: yup
    .string()
    .required(arabicMessages.required)
    .oneOf([yup.ref('password')], arabicMessages.passwordMatch),
  agreeToTerms: yup
    .boolean()
    .oneOf([true], arabicMessages.termsAgreement),
});

export type RegisterFormValues = yup.InferType<typeof registerSchema>;

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const forgotEmailSchema = yup.object({
  identifier: yup
    .string()
    .required(arabicMessages.required)
    .email(arabicMessages.email),
});

export const forgotPhoneSchema = yup.object({
  identifier: yup
    .string()
    .required(arabicMessages.required)
    .matches(/^[0-9]{7,15}$/, arabicMessages.phone),
});

export const resetPasswordSchema = yup.object({
  newPassword: yup
    .string()
    .required(arabicMessages.required)
    .test('has-digit', arabicMessages.passwordDigit, passwordTest)
    .test('has-special', arabicMessages.passwordSpecial, passwordTest)
    .test('min-length', arabicMessages.passwordLength, passwordTest),
  confirmPwd: yup
    .string()
    .required(arabicMessages.required)
    .oneOf([yup.ref('newPassword')], arabicMessages.passwordMatch),
});

export type ResetPasswordFormValues = yup.InferType<typeof resetPasswordSchema>;

// ─── Utility: extract field errors from a Yup ValidationError ─────────────────

export function yupErrorsToRecord(
  err: ValidationError,
): Record<string, string> {
  const record: Record<string, string> = {};
  if (err.inner && err.inner.length > 0) {
    for (const e of err.inner) {
      if (e.path && !record[e.path]) {
        record[e.path] = e.message;
      }
    }
  } else if (err.path) {
    record[err.path] = err.message;
  }
  return record;
}

/**
 * Validate a single field by its path and return the error message (or undefined).
 */
export async function validateField(
  schema: yup.AnySchema,
  path: string,
  value: unknown,
): Promise<string | undefined> {
  try {
    const field = yup.reach(schema, path) as yup.AnySchema;
    await field.validate(value);
    return undefined;
  } catch (err: unknown) {
    if (err instanceof yup.ValidationError) {
      return err.message;
    }
    return undefined;
  }
}
