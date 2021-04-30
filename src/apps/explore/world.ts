import yaml from 'js-yaml';

import {Universe} from '../../dimensions';
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
  private graph: Graph;
  stack: Path[][] = [];
  forawardTraversal = true;
  startKey = '';
  indexes: number[] = [];

  constructor(graphFile: string) {
    // Initialize universe.
    const universeFile = undefined;
    const universe = universeFile
      ? Universe.fromYamlFile(universeFile)!
      : new Universe(firewallSpec);
    const simplifier = createSimplifier<AnyRuleSpec>(universe);

    // Load network graph.
    const spec = loadYamlGraphSpecFile(graphFile);
    const builder = new GraphBuilder(universe, simplifier, spec);
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
      this.summarize();
    }
  }

  from(key: string) {
    this.forawardTraversal = true;
    this.startKey = key;
    this.stack = [this.graph.start(key, this.forawardTraversal)];
    this.indexes = [];
    this.summarize();
  }

  inspect(key: string | undefined) {
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

  keys() {
    return this.graph.nodes.map(x => x.key);
  }

  printNodes() {
    for (const node of this.graph.nodes) {
      console.log(node.key);
    }
  }

  step(index: number, toFork: boolean) {
    console.log(`step(${index},${toFork})`);
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
            console.log(`Cycle detected to node ${to}.`);
          } else {
            visited.add(to);
            this.stack.unshift(this.graph.step(path, this.forawardTraversal));
            this.indexes.unshift(0);
          }
        }

        this.summarize();
      }
    }
  }

  to(key: string) {
    this.forawardTraversal = false;
    this.startKey = key;
    this.stack = [this.graph.start(key, this.forawardTraversal)];
    this.indexes = [];
    this.summarize();
  }

  summarize() {
    const outbound = this.forawardTraversal;
    if (this.stack.length === 0) {
      console.log('No start node specified.');
      console.log('Use `from` or `to` command to specify start node.');
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
        console.log('Next steps:');
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
}
