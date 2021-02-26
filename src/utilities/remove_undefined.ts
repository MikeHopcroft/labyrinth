// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function removeUndefinedProperties(x: Record<string, any>): boolean {
  for (const key in x) {
    if (x[key] === undefined) {
      delete x[key];
    }
  }
  return Object.keys(x).length > 0;
}
