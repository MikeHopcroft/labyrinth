export class Stopwatch {
  private start!: bigint;

  constructor() {
    this.reset();
  }

  elaspedMS() {
    // tslint:disable-next-line:no-any
    const end: bigint = (process.hrtime as any).bigint();
    return Number(end - this.start) / 1.0e6;
  }

  format(): string {
    return `${this.elaspedMS()}ms`;
  }

  reset() {
    // tslint:disable-next-line:no-any
    this.start = (process.hrtime as any).bigint();
  }
}