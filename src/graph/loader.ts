import {FileSystem, YAML} from '..';

import {validate} from '../utilities';

import {GraphSpec, graphSpecType} from './types';

export function loadYamlGraphSpecFile(filename: string): GraphSpec {
  const text = FileSystem.readUtfFileSync(filename);
  return loadYamlGraphSpec(text);
}

export function loadYamlGraphSpec(text: string): GraphSpec {
  const root = YAML.load(text);
  const graph = validate(graphSpecType, root);
  return graph;
}
