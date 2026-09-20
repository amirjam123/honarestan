// Input validation and sanitization utilities

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - remove dangerous tags and attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "");
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateRequired(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null || value === "") {
    return `${fieldName} الزامی است`;
  }
  return null;
}

export function validateLength(value: string, min: number, max: number, fieldName: string): string | null {
  if (value.length < min) {
    return `${fieldName} باید حداقل ${min} کاراکتر باشد`;
  }
  if (value.length > max) {
    return `${fieldName} باید حداکثر ${max} کاراکتر باشد`;
  }
  return null;
}

export function validateNumeric(value: unknown, fieldName: string): string | null {
  if (value !== undefined && value !== null && isNaN(Number(value))) {
    return `${fieldName} باید عدد باشد`;
  }
  return null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateInput(
  data: Record<string, unknown>,
  rules: Record<string, (value: unknown) => string | null>
): ValidationResult {
  const errors: string[] = [];

  for (const [field, validator] of Object.entries(rules)) {
    const error = validator(data[field]);
    if (error) {
      errors.push(error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
