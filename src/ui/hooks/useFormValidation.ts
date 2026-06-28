import { useState } from "react";
import type { ZodType } from "zod";

export function useFormValidation<T>(schema: ZodType<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(values: unknown): T | null {
    const result = schema.safeParse(values);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || "_root";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return null;
    }

    setErrors({});
    return result.data;
  }

  return { errors, validate, clearErrors: () => setErrors({}) };
}
