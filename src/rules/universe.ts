console.log('importing universe.ts');

import * as t from 'io-ts';

import {
  Dimension,
  DimensionSpecType,
  DimensionType,
  DimensionTypeSpecType,
  IdGenerator
} from '../dimensions';


const UniverseSpecType = t.type({
  types: t.array(DimensionTypeSpecType),
  dimensions: t.array(DimensionSpecType)
});
export type UniverseSpec = t.TypeOf<typeof UniverseSpecType>;

export class Universe {
  private readonly keyToDimensionType = new Map<string, DimensionType>();
  readonly dimensions: Dimension[] = [];
  private readonly keyToDimension = new Map<string, Dimension>();
  private readonly idGenerator = new IdGenerator();

  constructor(spec: UniverseSpec) {
    // Create and index DimensionTypes.
    for (const s of spec.types) {
      const type = new DimensionType(s);
      if (this.keyToDimensionType.has(s.key)) {
        const message = `Duplicate dimension type key "${s.key}".`;
        throw new TypeError(message);
      }

      this.keyToDimensionType.set(s.key, type);
    }

    // Create and index Dimensions.
    for (const s of spec.dimensions) {
      const type = this.keyToDimensionType.get(s.type);
      if (type === undefined) {
        const message = `Unknown dimension type "${s.type}".`;
        throw new TypeError(message);
      }

      if (this.keyToDimension.has(s.key)) {
        const message = `Duplicate dimension type key "${s.key}".`;
        throw new TypeError(message);
      }

      const d = new Dimension(s.name, s.key, type, this.idGenerator);
      this.dimensions.push(d);
      this.keyToDimension.set(d.key, d);
    }
  }

  get(key: string): Dimension {
    const dimension = this.keyToDimension.get(key);
    if (dimension === undefined) {
      const message = `Unknown dimension "${key}".`;
      throw new TypeError(message);
    }
    return dimension;
  }
}
