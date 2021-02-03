import fs from 'fs';
import * as t from 'io-ts';
import yaml from 'js-yaml';

import {validate} from '../utilities';

import {GraphSpec, graphSpecType, NodeSpec, nodeSpecType} from './types';

// export function loadYamlNodeSpecsFile(filename: string): NodeSpec[] {
//   const text = fs.readFileSync(filename, 'utf8');
//   return loadYamlNodeSpecs(text);
// }

// export function loadYamlNodeSpecs(text: string): NodeSpec[] {
//   const root = yaml.safeLoad(text);
//   const nodes = validate(t.array(nodeSpecType), root);
//   return nodes;
// }

export function loadYamlGraphSpecFile(filename: string): GraphSpec {
  const text = fs.readFileSync(filename, 'utf8');
  return loadYamlGraphSpec(text);
}

export function loadYamlGraphSpec(text: string): GraphSpec {
  const root = yaml.safeLoad(text);
  const graph = validate(graphSpecType, root);
  return graph;
}
