import type { AnyObject, Schema } from 'yup';

// ===================== Validation Helper =====================

export function validateInput<TSchema extends Schema<unknown, AnyObject, unknown>>(
  schema: TSchema,
  input: unknown,
  createValidationError: () => Error
): ReturnType<TSchema['validateSync']> {
  try {
    return schema.validateSync(input, {
      abortEarly: false,
      stripUnknown: true,
    }) as ReturnType<TSchema['validateSync']>;
  } catch {
    throw createValidationError();
  }
}
