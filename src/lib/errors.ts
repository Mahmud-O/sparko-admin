/** Shape of backend validation/message errors */
export interface ApiFieldError {
  field: string;
  messages: string[];
}

/** Typed error for all API failures */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    /** Flat list of all error messages */
    public errors?: string[],
    /** Field-keyed validation errors, e.g. { PhoneNumber: "رقم الهاتف غير صحيح" } */
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
