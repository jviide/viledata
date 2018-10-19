export class Validator<Output = any, Input = Output> {
  constructor(
    readonly is: (input: unknown) => input is Input,
    readonly validate: (input: Input) => Output
  ) {}

  decode(input: unknown): Output {
    if (this.is(input)) {
      return this.validate(input);
    }
    throw new TypeError();
  }
}

export function create<Output>(
  is: (input: unknown) => input is Output,
  validate?: (input: Output) => Output
): Validator<Output>;
export function create<Output, Input = Output>(
  is: (input: unknown) => input is Input,
  validate: (input: Input) => Output
): Validator<Output, Input>;
export function create<Output, Input = Output>(is: any, validate: any): any {
  return new Validator(is, validate || ((val: any) => val));
}

export class ValidationError extends Error {}
