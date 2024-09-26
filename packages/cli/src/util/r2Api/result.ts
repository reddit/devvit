export class Result<T, E = string> {
  readonly ok: boolean;
  #error?: E;
  #value?: T;

  private constructor(success: true, value: T);
  private constructor(success: false, error?: E);
  private constructor(success: boolean, valueOrError?: T | E) {
    this.ok = success;
    if (success) {
      this.#value = valueOrError as T;
    } else {
      if (valueOrError != null) {
        this.#error = valueOrError as E;
      }
    }
  }

  get value(): T {
    if (!this.ok) {
      throw new Error('Cannot get value from failed result');
    }
    return this.#value!;
  }

  get error(): E | undefined {
    if (this.ok) {
      throw new Error('Cannot get error from non-failed result');
    }
    return this.#error;
  }

  static Ok<T>(value: T): Result<T, never> {
    return new Result(true, value);
  }

  static Err<E>(error?: E): Result<never, E> {
    return new Result(false, error);
  }
}
