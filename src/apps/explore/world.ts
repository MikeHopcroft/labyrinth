import yaml from 'js-yaml';

import {createFormatter, createIpFormatter, Universe} from '../../dimensions';

import {
  AnyRuleSpec,
  Graph,
  GraphBuilder,
  loadYamlGraphSpecFile,
  Path,
} from '../../graph';

import {createSimplifier} from '../../setops';
import {firewallSpec} from '../../specs';

export class World {
  private readonly universe: Universe;
  private readonly graph: Graph;

  private stack: Path[][] = [];
  private forawardTraversal = true;
  private startKey: string | undefined = undefined;
  private indexes: number[] = [];

  constructor(graphFile: string) {
    // Initialize universe.
    const universeFile = undefined;
    this.universe = universeFile
      ? Universe.fromYamlFile(universeFile)!
      : new Universe(firewallSpec);
    const simplifier = createSimplifier<AnyRuleSpec>(this.universe);

    // Load network graph.
    const spec = loadYamlGraphSpecFile(graphFile);
    const builder = new GraphBuilder(this.universe, simplifier, spec);
    this.graph = builder.buildGraph();
  }

  back(toFork: boolean) {
    if (this.stack.length === 0) {
      console.log('No current path.');
      console.log('Use `from` or `to` command to specify start node.');
    } else if (this.stack.length === 1) {
      console.log(`Can't go back. At start node "${this.startKey}"`);
    } else {
      this.stack.shift();
      this.indexes.shift();

      while (toFork && this.stack.length > 1 && this.stack[0].length === 1) {
        this.stack.shift();
        this.indexes.shift();
      }
      this.showPath();
    }
  }

  edges(key: string | undefined) {
    if (key === undefined) {
      if (this.stack.length > 0) {
        const edge = this.stack[0][0].edge;
        key = this.forawardTraversal ? edge.edge.from : edge.edge.to;
      } else {
        key = this.startKey;
      }
    }

    if (key === undefined) {
      console.log(
        "No current node. Either specify the node with 'inspect <node>' " +
          "or use the 'from <node>' or 'to <node>' commands to start a new traversal."
      );
    } else {
      const flowEdges = this.graph.flowEdges(key, this.forawardTraversal);
      for (const flowEdge of flowEdges) {
        const edge = flowEdge.edge;
        console.log('\t');
        console.log(`${edge.from} => ${edge.to}`);

        console.log('  routes:');
        console.log(edge.routes.format({prefix: '    '}));

        if (edge.override) {
          console.log('  override:');
          console.log(edge.override.format({prefix: '    '}));
        }
      }
    }
  }

  from(key: string) {
    this.forawardTraversal = true;
    this.startKey = key;
    this.stack = [this.graph.start(key, this.forawardTraversal)];
    this.indexes = [];
    this.showPath();
  }

  // Used for readline.Completer.
  keys() {
    return this.graph.nodes.map(x => x.key);
  }

  printNodes() {
    const friendlyNames = [...this.graph.friendlyNames()].sort();
    for (const name of friendlyNames) {
      const nodes = this.graph.withFriendlyName(name);
      console.log(name);

      for (const node of nodes.all()) {
        console.log(`  ${node.key}`);
      }
    }
  }

  spec(key: string | undefined) {
    if (key === undefined) {
      if (this.stack.length > 1) {
        const edge = this.stack[1][0].edge;
        // DESIGN NOTE: the `to` and `from` fields are not reversed in
        // the following line. We're looking for the endpoint of the
        // edge on the traversal. This is the current node.
        key = this.forawardTraversal ? edge.edge.to : edge.edge.from;
      } else {
        key = this.startKey;
      }
    }

    if (key === undefined) {
      console.log(
        "No current node. Either specify the node with 'inspect <node>' " +
          "or use the 'from <node>' or 'to <node>' commands to start a new traversal."
      );
    } else {
      const node = this.graph.node(key);
      const spec = node.spec;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {name, ...filteredSpec} = spec;
      const text = yaml.safeDump(filteredSpec);
      console.log('\t');
      console.log(text);
    }
  }

  showPath() {
    const outbound = this.forawardTraversal;
    if (this.stack.length === 0) {
      console.log('No start node specified.');
      console.log(
        'Use `from <node>` or `to <node>` command to specify start node.'
      );
    } else {
      if (this.indexes[0] !== undefined) {
        const path = this.stack[1][this.indexes[0]];
        console.log(
          this.graph.formatPath(path, outbound, {
            outbound,
          })
        );
        console.log('\t');
        console.log(path.routes.format({}));
      } else {
        console.log('\t');
        console.log(this.startKey);
        console.log('(universe)');
      }

      console.log('\t');
      if (this.stack[0].length > 0) {
        console.log(
          `Next step ${this.forawardTraversal ? 'forward' : 'backward'}:`
        );
        for (const [index, path] of this.stack[0].entries()) {
          const next = this.forawardTraversal
            ? path.edge.edge.to
            : path.edge.edge.from;
          console.log(`  ${index}: ${next}`);
        }
      } else {
        console.log('Path terminates here.');
      }
    }
  }

  step(index: number, toFork: boolean) {
    if (this.stack.length === 0) {
      console.log('No current path to step along.');
      console.log('Use `from` or `to` command to specify start node.');
    } else {
      const path = this.stack[0][index];
      if (path === undefined) {
        console.log(`Bad step ${index}.`);
        console.log(`Legal values: ${[...this.stack[0].keys()].join(', ')}.`);
      } else {
        // Follow path one step.
        this.stack.unshift(this.graph.step(path, this.forawardTraversal));
        this.indexes.unshift(index);

        // If toFork, then keep following as long as there is only one path to
        // follow.
        const visited = new Set<string>([path.edge.edge.to]);
        while (toFork && this.stack[0].length === 1) {
          const path = this.stack[0][0];
          const to = path.edge.edge.to;
          if (visited.has(to)) {
            console.log(`Cycle detected to node ${to}.\n`);
            break;
          } else {
            visited.add(to);
            this.stack.unshift(this.graph.step(path, this.forawardTraversal));
            this.indexes.unshift(0);
          }
        }

        this.showPath();
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  symbols(name: string | undefined) {
    const formatter = createFormatter(
      createIpFormatter(new Map<string, string>())
    );
    for (const dimension of this.universe.dimensionTypes()) {
      if (dimension.key === 'ip') {
        console.log(dimension.key);
        for (const [symbol, range] of dimension.symbolToRange.entries()) {
          console.log(`  ${symbol}: ${formatter(range)}`);
        }
      }
    }
  }

  to(key: string) {
    this.forawardTraversal = false;
    this.startKey = key;
    this.stack = [this.graph.start(key, this.forawardTraversal)];
    this.indexes = [];
    this.showPath();
  }
}
