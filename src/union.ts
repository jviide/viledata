import { Validator, create, ValidationError } from "./core";
import { undefined as _undefined } from "./primitives";

type UnionOutput<T extends [Validator, ...Validator[]]> = {
  [K in keyof T]: T[K] extends Validator<infer O> ? O : never
}[number];

type UnionInput<T extends [Validator, ...Validator[]]> = {
  [K in keyof T]: T[K] extends Validator<any, infer I> ? I : never
}[number];

export function union<T extends [Validator, ...Validator[]]>(
  ...validators: T
): Validator<UnionOutput<T>, UnionInput<T>> {
  return create(
    (obj: unknown): obj is UnionInput<T> => validators.some(v => v.is(obj)),
    obj => {
      for (const validator of validators) {
        if (!validator.is(obj)) {
          continue;
        }
        try {
          return validator.validate(obj);
        } catch (err) {
          if (!(err instanceof ValidationError)) {
            throw err;
          }
        }
      }
      throw new ValidationError();
    }
  );
}

export function optional<Output, Input>(validator: Validator<Output, Input>) {
  return union(validator, _undefined);
}
