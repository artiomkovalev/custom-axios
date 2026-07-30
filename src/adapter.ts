import CircuitBreaker from "opossum";
import type { TypedCircuitBreaker } from "@/types/request";

export class CircuitBreakerAdapter implements TypedCircuitBreaker {
  private instance: CircuitBreaker<[() => Promise<unknown>], unknown>;

  constructor(options: CircuitBreaker.Options) {
    this.instance = new CircuitBreaker(
      (action: () => Promise<unknown>) => action(),
      options
    );
  }

  public async fire<T>(action: () => Promise<T>): Promise<T> {
    let result: T | undefined;
    await this.instance.fire(async () => {
      result = await action();
      return result;
    });
    return result!;
  }

  public fallback(fn: (error: unknown) => unknown): void {
    this.instance.fallback((_, error) => fn(error));
  }
}
