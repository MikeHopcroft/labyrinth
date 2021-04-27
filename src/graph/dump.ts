import yaml from 'js-yaml';
import {Constraint} from '../rules';

import {Conjunction, Disjunction} from '../setops';
import {FlowAnalysis} from './graph';
import {AnyRuleSpec} from './types';

export interface DumpPath {
  from: string;
  routes: Constraint[];
}

export interface DumpNode {
  key: string;
  paths: DumpPath[];
}

export type DumpGraph = DumpNode[];

export function dump(analysis: FlowAnalysis) {
  const nodes: DumpNode[] = analysis.flows.map(n => ({
    key: n.node.key,
    paths: n.paths.map(p => ({
      from: p.edge.edge.from,
      routes: dumpDisjunction(p.routes),
    })),
  }));

  return nodes;
}

function dumpDisjunction(d: Disjunction<AnyRuleSpec>): Constraint[] {
  return d.conjunctions.map(dumpConjunction);
}

function dumpConjunction(c: Conjunction<AnyRuleSpec>): Constraint {
  const constraint: Constraint = {};

  for (const d of c.dimensions) {
    const formatted = d.format();
    const value = formatted.split(': ')[1];
    constraint[d.dimension.key] = value;
  }

  return constraint;
}

export function dumpGraphAsYamlText(analysis: FlowAnalysis): string {
  const nodes = dump(analysis);
  const yamlText = yaml.dump(nodes);
  return yamlText;
}
