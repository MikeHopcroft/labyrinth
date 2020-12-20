export class Stopwatch {
  private start!: bigint;

  constructor() {
    this.reset();
  }

  elaspedMS() {
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    const end: bigint = process.hrtime.bigint();
    return Number(end - this.start) / 1.0e6;
  }

  format(): string {
    return `${this.elaspedMS()}ms`;
  }

  reset() {
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    this.start = process.hrtime.bigint();
  }
}
