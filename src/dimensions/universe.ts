import * as t from 'io-ts';
import {FileSystem, YAML} from '..';

// TODO: POTENTIAL CIRCULAR REFERENCE?
import {SymbolDefinitionSpec} from '../graph';
import {validate} from '../utilities';

import {Dimension, codecDimensionSpec, IdGenerator} from './dimension';
import {DimensionType, codecDimensionTypeSpec} from './dimension_type';

const codecUniverseSpec = t.type({
  types: t.array(codecDimensionTypeSpec),
  dimensions: t.array(codecDimensionSpec),
});
export type UniverseSpec = t.TypeOf<typeof codecUniverseSpec>;

export function loadYamlUniverseSpec(text: string): UniverseSpec {
  const root = YAML.load(text);
  return validate(codecUniverseSpec, root);
}

export class Universe {
  readonly dimensions: Dimension[] = [];

  private readonly keyToDimensionType = new Map<string, DimensionType>();
  private readonly keyToDimension = new Map<string, Dimension>();
  private readonly idGenerator = new IdGenerator();

  static fromYamlFile(file: string, reservedWords?: Set<string>): Universe {
    console.log(`Load universe from "${file}".`);

    const text = FileSystem.readUtfFileSync(file);
    return Universe.fromYamlString(text, reservedWords);
  }

  static fromYamlString(text: string, reservedWords?: Set<string>): Universe {
    const root = YAML.load(text);
    const spec = validate(codecUniverseSpec, root);

    return new Universe(spec, reservedWords);
  }

  constructor(spec: UniverseSpec, reservedWords?: Set<string>) {
    // Create and index DimensionTypes.
    for (const s of spec.types) {
      const type = new DimensionType(s, reservedWords);
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

  defineSymbols(symbols: SymbolDefinitionSpec[]) {
    for (const {dimension, symbol, range} of symbols) {
      const dimensionType = this.keyToDimensionType.get(dimension);
      if (dimensionType === undefined) {
        const message = `Unknown dimension type "${dimension}".`;
        throw new TypeError(message);
      }
      dimensionType.defineSymbol(symbol, range);
    }
    for (const {dimension, symbol} of symbols) {
      const dimensionType = this.keyToDimensionType.get(dimension)!;
      dimensionType.indexSymbol(symbol);
    }
  }

  dimensionTypes(): DimensionType[] {
    return [...this.keyToDimensionType.values()];
  }
}
