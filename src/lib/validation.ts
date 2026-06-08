/**
 * Composable validation functions using the Strategy pattern.
 * Each validator returns an error message string or undefined.
 */

export type Validator<T = string> = (value: T) => string | undefined;

export const required =
  (message = 'هذا الحقل مطلوب'): Validator =>
  (value) => {
    if (typeof value === 'string' && !value.trim()) return message;
    if (typeof value === 'boolean' && !value) return message;
    if (!value) return message;
    return undefined;
  };

export const email =
  (message = 'البريد الإلكتروني غير صالح'): Validator =>
  (value) => {
    if (!value) return undefined; // let required handle emptiness
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value) ? undefined : message;
  };

export const minLength =
  (min: number, message?: string): Validator =>
  (value) => {
    if (!value) return undefined;
    if ((value as string).length < min)
      return message ?? `يجب أن يكون الطول ${min} أحرف على الأقل`;
    return undefined;
  };

export const password = (
  messages?: { digit?: string; special?: string; length?: string },
): Validator<string> => {
  return (value) => {
    if (!value) return undefined;
    if (!/\d/.test(value)) return messages?.digit ?? 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل';
    if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(value))
      return messages?.special ?? 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل';
    if (value.length < 8) return messages?.length ?? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل';
    return undefined;
  };
};

export const match =
  (target: string, message = 'كلمتا المرور غير متطابقتين'): Validator =>
  (value) => {
    if (!value) return undefined;
    return value === target ? undefined : message;
  };

export const phone =
  (message = 'رقم الجوال غير صالح'): Validator =>
  (value) => {
    if (!value) return undefined;
    const re = /^[0-9]{7,15}$/;
    return re.test(value.replace(/\s/g, '')) ? undefined : message;
  };

/**
 * Run multiple validators and return the first error found.
 */
export function validate(value: string, validators: Validator[]): string | undefined {
  for (const v of validators) {
    const err = v(value);
    if (err) return err;
  }
  return undefined;
}

/**
 * Validate a record of values against a record of validator arrays.
 * Returns a record of field → error message (or undefined).
 */
export function validateForm<T extends Record<string, string | boolean>>(
  values: T,
  rules: Partial<Record<keyof T, Validator[]>>,
): Partial<Record<keyof T, string | undefined>> {
  const errors: Partial<Record<keyof T, string | undefined>> = {};
  for (const [field, validators] of Object.entries(rules) as [keyof T, Validator[]][]) {
    if (validators) {
      errors[field] = validate(String(values[field] ?? ''), validators);
    }
  }
  return errors;
}
