import fs from 'fs';
import * as t from 'io-ts';
import yaml from 'js-yaml';

import {validate} from '../utilities';

import {NodeSpec, nodeSpecType} from './types';

export function loadYamlNodeSpecsFile(filename: string): NodeSpec[] {
  const text = fs.readFileSync(filename, 'utf8');
  return loadYamlNodeSpecs(text);
}

export function loadYamlNodeSpecs(text: string): NodeSpec[] {
  const root = yaml.safeLoad(text);
  const nodes = validate(t.array(nodeSpecType), root) as NodeSpec[];
  return nodes;
}
