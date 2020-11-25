export class Telemetry {
  readonly data = new Map<string, number>();

  increment(key: string) {
    const value = this.data.get(key) || 0;
    this.data.set(key, value + 1);
    // console.log(`increment ${key}: ${value + 1}`);
  }
}

export const setopsTelemetry = new Telemetry();

export class Snapshot {
  readonly telemetry: Telemetry;
  private snapshot!: Map<string, number>;
  private current!: Map<string, number>;

  constructor(telemetry: Telemetry) {
    this.telemetry = telemetry;
    this.reset();
    this.start();
  }

  start() {
    this.current = this.telemetry.data;
  }

  stop() {
    this.current = new Map<string, number>(this.telemetry.data);
  }

  reset() {
    this.snapshot = new Map<string, number>(this.telemetry.data);
  }

  format(prefix = ''): string {
    const lines: string[] = [];
    const keys = [...this.current.keys()].sort();
    for (const key of keys) {
      const value1 = this.current.get(key) || 0;
      const value0 = this.snapshot.get(key) || 0;
      lines.push(`${prefix}${key}: ${value1 - value0}`);
    }
    lines.push('');
    return lines.join('\n');
  }
}
