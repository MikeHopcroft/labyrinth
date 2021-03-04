export function throwIfEmptyString(input: string, message: string) {
  if (input === null || input === '' || input === undefined) {
    throw new TypeError(message);
  }
}

export function throwIfEmpty<T>(input: T, message: string): T {
  if (input === null || input === undefined) {
    throw new TypeError(message);
  }
  return input;
}
