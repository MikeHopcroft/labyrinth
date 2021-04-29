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
    console.log(`Loading ${graphFile}`);
    const spec = loadYamlGraphSpecFile(graphFile);
    const builder = new GraphBuilder(universe, simplifier, spec);
    this.graph = builder.buildGraph();
  }

  back() {
    if (this.stack.length === 0) {
      console.log('No current path.');
      console.log('Use `from` or `to` command to specify start node.');
    } else if (this.stack.length === 1) {
      console.log(`Can't go back. At start node "${this.startKey}"`);
    } else {
      this.stack.shift();
      this.indexes.shift();
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

  nodes() {
    for (const node of this.graph.nodes) {
      console.log(node.key);
    }
  }

  step(index: number) {
    if (this.stack.length === 0) {
      console.log('No current path to step along.');
      console.log('Use `from` or `to` command to specify start node.');
    } else {
      const path = this.stack[0][index];
      if (path === undefined) {
        console.log(`Bad step ${index}.`);
        console.log(`Legal values: ${[...this.stack[0].keys()].join(', ')}.`);
      } else {
        this.stack.unshift(this.graph.step(path, this.forawardTraversal));
        this.indexes.unshift(index);
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
          console.log(
            `  ${index}: ${path.edge.edge.from} => ${path.edge.edge.to}`
          );
        }
      } else {
        console.log('Path terminates here.');
      }
    }
  }
}
