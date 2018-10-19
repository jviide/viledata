import { create } from "./core";

export const string = create(
  (obj: unknown): obj is string => typeof obj === "string"
);

export const number = create(
  (obj: unknown): obj is number => typeof obj === "number"
);

export const boolean = create(
  (obj: unknown): obj is boolean => typeof obj === "boolean"
);

const _undefined = create(
  (input: unknown): input is undefined => typeof input === "undefined"
);
export { _undefined as undefined };

const _null = create((input: unknown): input is null => input === null);
export { _null as null };
