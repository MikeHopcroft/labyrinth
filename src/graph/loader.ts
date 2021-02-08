import fs from 'fs';
import yaml from 'js-yaml';

import {validate} from '../utilities';

import {GraphSpec, graphSpecType} from './types';

export function loadYamlGraphSpecFile(filename: string): GraphSpec {
  const text = fs.readFileSync(filename, 'utf8');
  return loadYamlGraphSpec(text);
}

export function loadYamlGraphSpec(text: string): GraphSpec {
  const root = yaml.safeLoad(text);
  const graph = validate(graphSpecType, root);
  return graph;
}
