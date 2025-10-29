/** Error.cause detail. */
export type CircuitBreakCause = {
  /** API method called that failed. Eg, UserDataByAccountIds. */
  method: string | undefined;
  stack: string | undefined;
};

// This message is referenced in LocalRuntimeJSEngine.kt.
export const CIRCUIT_BREAKER_MSG = <const>'ServerCallRequired';

// to-do: use TypeScript to reference this function in SandboxedRuntimeLite.
/** @arg method API method called for debugging. Eg, UserDataByAccountIds. */
export function CircuitBreak(method: string | undefined): Error {
  // Warning: this function is serialized by SandboxRuntimeLite. Don't use
  // import dependencies.
  // Error must be postable.
  const err = Error('ServerCallRequired' satisfies typeof CIRCUIT_BREAKER_MSG);
  err.cause = { method, stack: err.stack } satisfies CircuitBreakCause;
  return err;
}

export class CircuitBreakerResponse extends Error {
  readonly response: unknown | undefined;
  override readonly cause: CircuitBreakCause;

  constructor(response: unknown, cause: CircuitBreakCause) {
    super(CIRCUIT_BREAKER_MSG);
    this.response = response;
    this.cause = cause;
    this.name = 'CircuitBreakerResponse';
  }
}

export function isCircuitBreaker(
  err: Error | CircuitBreakerResponse | unknown
): err is CircuitBreakerResponse {
  return (err as Error)?.message === CIRCUIT_BREAKER_MSG;
}
