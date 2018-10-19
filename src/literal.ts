import { Validator, ValidationError, create } from "./core";

type Literal = string | number | boolean;

const TYPES = new Set(["string", "number", "boolean"]);

export function literal<T extends [Literal, ...Literal[]]>(
  ...args: T
): Validator<T[number]> {
  const values = new Set(args);
  return create(
    (input: unknown): input is T[number] => TYPES.has(typeof input),
    (value: Literal): Literal => {
      if (values.has(value)) {
        return value;
      }
      throw new ValidationError("invalid literal");
    }
  );
}
