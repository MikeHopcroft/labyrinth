import {loadYamlUniverseSpec, Universe, UniverseSpec} from '../dimensions';

import {
  ForwardRuleSpecEx,
  Graph,
  GraphBuilder,
  loadYamlNodeSpecs,
  NodeSpec,
} from '../graph';

import {createSimplifier, Simplifier} from '../setops';

export interface World {
  graph: Graph;
  universe: Universe;
  simplifier: Simplifier<ForwardRuleSpecEx>;
}

export function createWorldFromYaml(
  universeYamlText: string,
  configYamlText: string
): World {
  const graphSpec = loadYamlNodeSpecs(configYamlText);
  const universeSpec = loadYamlUniverseSpec(universeYamlText);
  return createWorld(universeSpec, graphSpec);
}

export function createWorld(
  universeSpec: UniverseSpec,
  nodes: NodeSpec[]
): World {
  const universe = new Universe(universeSpec);
  const simplifier = createSimplifier<ForwardRuleSpecEx>(universe);
  const builder = new GraphBuilder(universe, simplifier, nodes);
  const graph = builder.buildGraph();

  return {graph, universe, simplifier};
}
