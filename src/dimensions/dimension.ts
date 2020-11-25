console.log('importing dimension.ts');
import DRange from 'drange';
import * as t from 'io-ts';

import { Conjunction, DimensionedRange } from '../setops';

import { DimensionType } from './dimension_type';

export class IdGenerator {
  nextId = 1;

  constructor(startId = 1) {
    this.nextId = startId;
  }

  next() {
    return this.nextId++;
  }
}

export const DimensionSpecType = t.type({
  name: t.string,
  key: t.string,
  type: t.string
});
export type DimensionSpec = t.TypeOf<typeof DimensionSpecType>;

export type DimensionFormatter = (r: DRange) => string;

export class Dimension {
  private static idGenerator = new IdGenerator();

  readonly name: string;
  readonly key: string;
  readonly type: DimensionType;
  readonly id: number;

  // DESIGN NOTE: optional idGenerator is provideto simplify unit tests.
  constructor(
    name: string,
    key: string,
    type: DimensionType,
    idGenerator?: IdGenerator
  ) {
    this.name = name;
    // TODO: IMPLEMENT
    // TODO: check for key collision with Rule: action, priority
    // TODO: check for illegal key
    //   https://stackoverflow.com/questions/1661197/what-characters-are-valid-for-javascript-variable-names/9337047#9337047
    //   https://mathiasbynens.be/notes/javascript-identifiers-es6
    this.key = key;
    this.type = type;
    this.id = (idGenerator || Dimension.idGenerator).next()
  }

  // private constructorOld(
  //   name: string,
  //   type: DimensionType,
  //   // formatter?: DimensionFormatter,
  //   // start?: number,
  //   // end?: number
  // ) {
  //   if (name === Dimension.reservedName) {
  //     const message = `Dimension name "${Dimension.reservedName} is reserved."`;
  //     throw new TypeError(message);
  //   }
  //   // if (typeName === Dimension.reservedTypeName) {
  //   //   const message = `Dimension type name "${Dimension.reservedTypeName} is reserved."`;
  //   //   throw new TypeError(message);
  //   // }
  //   this.name = name || Dimension.reservedName;
  //   // this.typeName = typeName || Dimension.reservedName;
  //   this.formatter = formatter || Dimension.reservedFormatter;

  //   if (start === undefined) {
  //     // This is the empty dimension.
  //     this.id = Dimension.reservedId;
  //     this.domain = new DRange();
  //   } else {
  //     if (end !== undefined && start > end) {
  //       const message = 'Start of domain cannot be greater than end of domain.';
  //       throw new TypeError(message);
  //     }

  //     this.id = Dimension.nextId++;
  //     this.domain = new DRange(start, end);
  //   }
  // }

  parse(text: string): Conjunction {
    const range = this.type.parser(text);
    return Conjunction.create([
      new DimensionedRange(this, range)
    ]);
  }
}
