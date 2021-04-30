import commandLineUsage, {Section} from 'command-line-usage';
import fs from 'fs';
import minimist from 'minimist';

import {Universe} from '../dimensions';

import {
  AnyRuleSpec,
  dumpGraphAsYamlText,
  // formatNodeName,
  Graph,
  GraphBuilder,
  loadYamlGraphSpecFile,
  Node,
  NodeSpec,
  // NodeType,
} from '../graph';

import {createSimplifier} from '../setops';
import {firewallSpec} from '../specs';
import {fail, handleError, succeed} from '../utilities';

interface Options {
  backProject: boolean;
  outbound: boolean;
  // TODO: rename shortenAndCollapse to expandPaths or equivalent
  shortenAndCollapse: boolean;
  showPaths: boolean;
  showRouters: boolean;
  verbose: boolean;
}

export default function main(invocation: string, parameters: string[]) {
  const args = minimist(parameters);

  if (args.h || args.help) {
    showUsage(invocation);
    return succeed(false);
  }

  if (args._.length === 0) {
    return fail('Error: expected a <network.yaml> file.');
  }

  if (args._.length > 1) {
    const extras = args._.slice(1)
      .map(x => `"${x}"`)
      .join(', ');
    return fail(`Error: undexpected parameters ${extras}.`);
  }

  if (args.c) {
    return fail('Cycle detection not implemented.');
  }

  const backProject = !!args.b && !args.t;
  const fromNode = args.f;
  const outbound = !args.t;
  const quietMode = !!args.q;
  const showRouters = !!args.r;
  const shortenAndCollapse = !args.e;
  const toNode = args.t;
  const verbose = !!args.v;
  const showPaths = verbose || !!args.p;
  const universeFile = args.u;
  const graphFile = args._[0];

  const options: Options = {
    backProject,
    outbound,
    showPaths,
    showRouters,
    verbose,
    shortenAndCollapse,
  };

  try {
    // Initialize universe.
    const universe = universeFile
      ? Universe.fromYamlFile(universeFile)!
      : new Universe(firewallSpec);
    const simplifier = createSimplifier<AnyRuleSpec>(universe);

    // Load network graph.
    const spec = loadYamlGraphSpecFile(graphFile);
    const builder = new GraphBuilder(universe, simplifier, spec);
    const graph = builder.buildGraph();

    // TODO: put -t case first and include -t -f handling there so that we get
    // back-projection by default.
    if (!fromNode && !toNode) {
      listEndpoints(graph, showRouters);
      return fail('Use the -f or -t option to specify a node for analysis.');
    } else if (toNode) {
      /////////////////////////////////////////////////////////////////////////
      //
      // Paths ending at toNode
      //
      /////////////////////////////////////////////////////////////////////////
      // const tNode = getNode(toNode, graph, false);
      // const tKey = tNode.key;
      const tNodes = getKeys(toNode, graph, false);
      const tKeys = tNodes.map(x => x.key);

      // let fNode: Node | undefined;
      // let fKey: string | undefined;
      let fNodes: Node[] | undefined;
      let fKeys: string[] | undefined;
      if (fromNode) {
        fNodes = getKeys(fromNode, graph, true);
        fKeys = fNodes.map(x => x.key);
      }

      const {cycles, flows} = graph.analyze(tKeys, options.outbound);

      if (args.d) {
        fs.writeFileSync(
          'debug.yaml',
          dumpGraphAsYamlText({cycles, flows}),
          'utf8'
        );
      }

      if (!quietMode) {
        summarizeOptions(options);
        listEndpoints(graph, showRouters);
      }

      if (cycles.length > 0) {
        console.log(`Cycles on paths to ${toNode}:`);
        for (const cycle of cycles) {
          console.log('  ' + graph.formatCycle(cycle));
          console.log();
        }
        console.log();
      }

      if (fNodes) {
        console.log(`Routes from ${fromNode} to ${toNode}:`);
      } else {
        console.log(`Nodes that can reach ${toNode}:`);
      }
      console.log();

      for (const flow of flows) {
        if (fKeys) {
          if (matchesName(flow.node.spec, fromNode)) {
            console.log(graph.formatFlow(flow, options));
            console.log();
          }
        } else if (
          !matchesName(flow.node.spec, toNode) &&
          //          tKey !== flow.node.spec.key &&
          (showRouters || !flow.node.spec.internal) &&
          !flow.routes.isEmpty()
        ) {
          console.log(graph.formatFlow(flow, options));
          console.log();
        }
      }
    } else {
      /////////////////////////////////////////////////////////////////////////
      //
      // Paths originating at fromNode
      //
      /////////////////////////////////////////////////////////////////////////
      // const fNode = getNode(fromNode, graph, true);
      // const fKey = fNode.key;
      const fNodes = getKeys(fromNode, graph, false);
      const fKeys = fNodes.map(x => x.key);

      const {cycles, flows} = graph.analyze(fKeys, options.outbound);

      if (args.d) {
        fs.writeFileSync(
          'debug.yaml',
          dumpGraphAsYamlText({cycles, flows}),
          'utf8'
        );
      }

      if (!quietMode) {
        summarizeOptions(options);
        listEndpoints(graph, showRouters);
      }

      if (cycles.length > 0) {
        console.log(`Cycles reachable from ${fromNode}:`);
        for (const cycle of cycles) {
          console.log('  ' + graph.formatCycle(cycle, verbose));
          console.log();
        }
        console.log();
      }

      console.log(`Nodes reachable from ${fromNode}:`);
      console.log();

      for (const flow of flows) {
        if (
          fromNode !== flow.node.spec.key &&
          (showRouters || !flow.node.spec.internal) &&
          !flow.routes.isEmpty()
        ) {
          console.log(graph.formatFlow(flow, options));
          console.log();
        }
      }
    }
  } catch (e) {
    handleError(e);
  }

  return succeed(true);
}

function showUsage(invocation: string) {
  const usage: Section[] = [
    {
      header: 'Network graph reachability analyzer',
      content: 'Utility for analyzing reachability in networks.',
    },
    {
      header: 'Usage',
      content: [`${invocation} {underline <network.yaml>} [...options]`],
    },
    {
      header: 'Required Parameters',
      content: [
        {
          name: '{underline <network.yaml>}',
          summary:
            'Path to a yaml file the defines the network topology and ' +
            'its routing and filtering rules.',
        },
      ],
    },
    {
      header: 'Options',
      optionList: [
        {
          name: 'from',
          alias: 'f',
          typeLabel: '{underline <node>}',
          description:
            'Find all paths in the graph that start at {underline <node>}.',
        },
        {
          name: 'to',
          alias: 't',
          typeLabel: '{underline <node>}',
          description:
            'Find all paths in the graph that can reach {underline <node>}.',
        },
        {
          name: 'universe',
          alias: 'u',
          typeLabel: '{underline <universe.yaml>}',
          description: `Use provided Universe specification.
                        Default Universe is for firewall rules with
                        - source ip
                        - source port
                        - destination ip
                        - destination port
                        - protocol\n`,
          type: Boolean,
        },
        {
          name: 'verbose',
          alias: 'v',
          description: 'Display routes for each path.',
          type: Boolean,
        },
        // TODO: advertise this feature once it has been fully implemented.
        // {
        //   name: 'cycles',
        //   alias: 'c',
        //   description: 'Find all cycles in the graph.',
        //   type: Boolean,
        // },
        {
          name: 'paths',
          alias: 'p',
          description: 'Displays paths for each route.',
          type: Boolean,
        },
        {
          name: 'quiet',
          alias: 'q',
          description:
            "Quiet mode - don't summarize options and enumerate nodes.",
          type: Boolean,
        },
        {
          name: 'routers',
          alias: 'r',
          description: 'Display routers along paths.',
          type: Boolean,
        },
        {
          name: 'back-project',
          alias: 'b',
          description:
            'Backproject routes through NAT rewrites. Note that back-projecting is enabled by default when -t is used.',
          type: Boolean,
        },
        {
          name: 'expand',
          alias: 'e',
          description: 'Expand paths to show internal nodes.',
          type: Boolean,
        },
      ],
    },
  ];

  console.log(commandLineUsage(usage));
}

function listEndpoints(graph: Graph, showRouters: boolean) {
  console.log('Nodes:');

  const friendlyNames = [...graph.friendlyNames()].sort();
  for (const name of friendlyNames) {
    const nodes = graph.withFriendlyName(name);
    if (showRouters || nodes.notInternal()) {
      console.log(`  ${name}${nodes.notInternal() ? '' : '*'}`);

      for (const node of nodes.all()) {
        console.log(`    ${node.key}${node.spec.internal ? '*' : ''}`);
      }
    }
  }
  console.log();
}

function summarizeOptions(options: Options) {
  console.log('Options summary:');

  if (options.showRouters) {
    console.log('  Displaying endpoints and routing nodes. (-r)');
  } else {
    console.log(
      '  Displaying endpoints only (use -r flag to display routing nodes). '
    );
  }

  if (options.showPaths) {
    console.log('  Displaying paths (-p or -v).');
  } else {
    console.log('  Not displaying paths (use -s or -v flags to enable).');
  }

  if (options.showPaths) {
    console.log('  Verbose mode (-v).');
  } else {
    console.log('  Brief mode (use -v flag to enable verbose mode).');
  }

  if (!options.outbound) {
    console.log('  Backprojecting unnecessary with -t.');
  } else if (options.backProject) {
    console.log('  Backprojecting paths past NAT rewrites. (-b)');
  } else {
    console.log(
      '  Paths are forward propagated (use -b flag to enable backprojection).'
    );
  }

  if (options.shortenAndCollapse) {
    console.log(
      '  Paths are not expanded (use -e flag to enable path expansion).'
    );
  } else {
    console.log('  Expanding paths to show internal nodes. (-e)');
  }

  console.log('  Not displaying help. (use -h flag to display help message)');

  console.log();
}

function getKeys(name: string, graph: Graph, outbound: boolean): Node[] {
  const nodes = graph.withFriendlyName(name).all();
  if (nodes.length > 0) {
    return nodes;
  }

  const node = graph.withKey(name);
  if (node) {
    return [node];
  }

  fail(`Unknown ${outbound ? 'start' : 'end'} node ${name}`);
}

function matchesName(spec: NodeSpec, name: string): boolean {
  return spec.friendlyName === name || spec.key === name;
}
