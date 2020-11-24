import * as t from 'io-ts';

import {
  Dimension,
  DimensionTypeSpecType,
  IdGenerator
} from '../setops';

import {
} from './formatters';

import {
} from './parser';


const DimensionSpecType = t.type({
  name: t.string,
  type: t.string
});
export type DimensionSpec = t.TypeOf<typeof DimensionSpecType>;

const UniverseSpecType = t.type({
  types: t.array(DimensionTypeSpecType),
  dimensions: t.array(DimensionSpecType)
});
export type UniverseSpec = t.TypeOf<typeof UniverseSpecType>;

class Universe {
  private readonly dimensions: Dimension[] = [];
  private readonly keyToDimension = new Map<string, Dimension>();
  private readonly idGenerator = new IdGenerator();

  constructor(spec: UniverseSpec) {
  }
}
