export class Wrapper<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  /**
   * Get the value wrapped by `this` wrapper.
   * @returns the wrapped value, whose type is `T`
   */
  item(): T {
    return this.value;
  }

  /**
   * Calls the specified function block with `this` value as its argument and returns a `Wrapper` that wraps its
   * result, regardless whether the result is undefined or not.
   * @param block - The function to be executed with `this` as argument
   * @returns a `Wrapper` that wraps `block`'s result
   */
  let<R>(block: (it: T) => R): Wrapper<R> {
    const result = block(this.value);
    return new Wrapper<R>(result);
  }

  /**
   * Calls the specified function block with `this` value as its argument and returns `this` value
   * @param block - The function to be executed with `this` as argument
   * @returns `this`, which is a Wrapper
   */
  also(block: (it: T) => void): Wrapper<T> {
    block(this.value);
    return this;
  }

  /**
   * Calls the specified function block with `this` value as its receiver and returns a `Wrapper` that wraps its
   * result, regardless whether the result is undefined or not.
   * @param block - The function to be executed with `this` as context
   * @returns a `Wrapper` that wraps `block`'s result
   */
  run<R>(block: (this: T) => R): Wrapper<R> {
    const result = block.call(this.value);
    return new Wrapper<R>(result);
  }

  /**
   * Calls the specified function block with `this` value as its receiver and returns `this` value
   * @param block - The function to be executed with `this` as context
   * @returns `this`, which is a Wrapper
   */
  apply(block: (this: T) => void): Wrapper<T> {
    block.call(this.value);
    return this;
  }

  /**
   * Returns `this` value if it satisfies the given predicate or `undefined` if it doesn't
   * @param predicate - The function to be executed with `this` as argument and returns a truthy or falsy value
   * @returns `this` which is still a Wrapper or `undefined`
   */
  takeIf(predicate: (it: T) => boolean): Wrapper<T> | undefined {
    return predicate(this.value) ? this : undefined;
  }

  /**
   * Returns `this` value if it does not satisfy the given predicate or `undefined` if it does
   * @param predicate - The function to be executed with `this` as argument and returns a truthy or falsy value
   * @returns `this` which is still a Wrapper or `undefined`
   */
  takeUnless(predicate: (it: T) => boolean): Wrapper<T> | undefined {
    return predicate(this.value) ? undefined : this;
  }
}

export function use<T>(value: T): Wrapper<T> {
  return new Wrapper<T>(value);
}

export default use;
