import { Validator, ValidationError } from "./core";

type ObjectInput = { [K: string]: unknown };

type RequiredKeys<T> = {
  [K in keyof T]: T[K] extends Validator<any, infer I>
    ? (Extract<I, undefined> extends never ? K : never)
    : never
}[keyof T];

type OptionalKeys<T> = {
  [K in keyof T]: T[K] extends Validator<any, infer I>
    ? (Extract<I, undefined> extends never ? never : K)
    : never
}[keyof T];

class ObjectValidator<T extends { [K: string]: Validator }> extends Validator<
  { [K in RequiredKeys<T>]: T[K] extends Validator<infer O> ? O : never } &
    { [K in OptionalKeys<T>]?: T[K] extends Validator<infer O> ? O : never },
  ObjectInput
> {
  readonly _input: T;

  constructor(input: T) {
    const allKeys = new Set(Object.keys(input));
    const requiredKeys = new Set(
      Array.from(allKeys).filter(key => !input[key].is(undefined))
    );

    super(
      (obj: unknown): obj is ObjectInput => {
        return typeof obj === "object" && obj !== null;
      },
      obj => {
        const objKeys = new Set(Object.keys(obj));
        for (const key of requiredKeys) {
          if (!objKeys.has(key)) {
            throw new ValidationError("required key missing");
          }
        }
        for (const key of objKeys) {
          if (!allKeys.has(key)) {
            throw new ValidationError("extra key");
          }
        }
        const result: any = {};
        for (const key of allKeys) {
          const value = objKeys.has(key) ? obj[key] : undefined;
          result[key] = input[key].validate(value);
        }
        return result;
      }
    );

    this._input = input;
  }
}

export function object<T extends { [K: string]: Validator }>(input: T) {
  return new ObjectValidator(input);
}

type KeysOf<T extends { [K: string]: any }[]> = {
  [K in keyof T]: keyof T[K]
}[number];

type NonIntersecting<T extends { [K: string]: Validator }[]> = {
  [K: string]: Validator;
} & { [K in KeysOf<T>]?: never };

export function merge<
  T1 extends NonIntersecting<[T2]>,
  T2 extends NonIntersecting<[T1]>
>(o1: ObjectValidator<T1>, o2: ObjectValidator<T2>): ObjectValidator<T1 & T2>;
export function merge<
  T1 extends NonIntersecting<[T2, T3]>,
  T2 extends NonIntersecting<[T1, T3]>,
  T3 extends NonIntersecting<[T1, T2]>
>(
  o1: ObjectValidator<T1>,
  o2: ObjectValidator<T2>,
  o3: ObjectValidator<T3>
): ObjectValidator<T1 & T2 & T3>;
export function merge(
  ...validators: ObjectValidator<any>[]
): ObjectValidator<any> {
  const inputs = validators.map(validator => validator._input);
  return object(Object.assign({}, ...inputs));
}
