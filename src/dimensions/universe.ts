import fs from 'fs';
import * as t from 'io-ts';
import yaml from 'js-yaml';

import {validate} from '../utilities';

import {Dimension, DimensionSpecType, IdGenerator} from './dimension';
import {DimensionType, DimensionTypeSpecType} from './dimension_type';

const UniverseSpecType = t.type({
  types: t.array(DimensionTypeSpecType),
  dimensions: t.array(DimensionSpecType),
});
export type UniverseSpec = t.TypeOf<typeof UniverseSpecType>;

export function loadYamlUniverseSpec(text: string): UniverseSpec {
  const root = yaml.safeLoad(text);
  return validate(UniverseSpecType, root);
}

export class Universe {
  readonly dimensions: Dimension[] = [];

  private readonly keyToDimensionType = new Map<string, DimensionType>();
  private readonly keyToDimension = new Map<string, Dimension>();
  private readonly idGenerator = new IdGenerator();

  static fromYamlFile(file: string, reservedWords?: Set<string>): Universe {
    console.log(`Load universe from "${file}".`);

    const text = fs.readFileSync(file, 'utf8');
    return Universe.fromYamlString(text, reservedWords);
  }

  static fromYamlString(text: string, reservedWords?: Set<string>): Universe {
    const root = yaml.safeLoad(text);
    const spec = validate(UniverseSpecType, root);

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

  defineSymbol(
    key: string,
    symbol: string,
    range: string,
    indexRange = false
  ) {
    const dimensionType = this.keyToDimensionType.get(key);
    if (dimensionType === undefined) {
      const message = `Unknown dimension type "${key}".`;
      throw new TypeError(message);
    }
    dimensionType.defineSymbol(symbol, range, indexRange);
  }
}

/*
symbols:
  - dimension: ip
    symbol: vnet
    range: 1.2.3.4
  - dimension: ip
    symbol: AzureLoadBalancer
    range: 4.5.6.7
  - dimension: ip
    symbol: Internet
    range: internet
  - dimension: protocol
    symbol: Tcp
    range: '6'


symbols:
  - dimension: destinationIp
    symbol: vnet
    value: 1.2.3.4
  - dimension: destinationIp
    symbol: AzureLoadBalancer
    value: 4.5.6.7
  - dimension: destinationIp
    symbol: Internet
    value: internet
  - dimension: protocol
    symbol: Tcp
    value: '6'
*/
