import DRange from 'drange';

export type DimensionFormatter = (r: DRange) => string;

export class Dimension {
  private static reservedId = 0;
  private static reservedName = 'empty';
  private static reservedTypeName = 'empty type';
  private static reservedFormatter = (r: DRange) => 'none';
  static reserved: Dimension = new Dimension();
  private static nextId = 100;

  readonly name: string;
  readonly typeName: string;
  readonly formatter: DimensionFormatter;
  readonly id: number;
  readonly domain: DRange;

  static create(
    name: string,
    typeName: string,
    formatter: DimensionFormatter,
    start?: number,
    end?: number
  ): Dimension {
    if (start === undefined) {
      return Dimension.reserved;
    } else {
      return new Dimension(name, typeName, formatter, start, end);
    }
  }

  private constructor(
    name?: string,
    typeName?: string,
    formatter?: DimensionFormatter,
    start?: number,
    end?: number
  ) {
    if (name === Dimension.reservedName) {
      const message = `Dimension name "${Dimension.reservedName} is reserved."`;
      throw new TypeError(message);
    }
    if (typeName === Dimension.reservedTypeName) {
      const message = `Dimension type name "${Dimension.reservedTypeName} is reserved."`;
      throw new TypeError(message);
    }
    this.name = name || Dimension.reservedName;
    this.typeName = typeName || Dimension.reservedName;
    this.formatter = formatter || Dimension.reservedFormatter;

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
