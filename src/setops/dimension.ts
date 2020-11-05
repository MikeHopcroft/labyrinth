import DRange from 'drange';

export class Dimension {
  private static reservedId = 0;
  static reserved: Dimension = new Dimension();
  private static nextId = 100;

  readonly id: number;
  readonly domain: DRange;

  static create(start?: number, end?: number): Dimension {
    if (start === undefined) {
      return Dimension.reserved;
    } else {
      return new Dimension(start, end);
    }
  }

  private constructor(start?: number, end?: number) {
    if (start === undefined) {
      // This is the empty dimension.
      this.id = Dimension.reservedId;
      this.domain = new DRange();
    } else {
      if (end !== undefined && start > end) {
        const message = 'Start of domain cannot be greater than end of domain.';
        throw new TypeError(message);
      }

      this.id = Dimension.nextId++;
      this.domain = new DRange(start, end);
    }
  }
}
