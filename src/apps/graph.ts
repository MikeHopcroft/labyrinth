import commandLineUsage from 'command-line-usage';
import {Section} from 'command-line-usage';
import minimist from 'minimist';
import path from 'path';

import {Universe} from '../dimensions';

import {
  AnyRuleSpec,
  Graph,
  GraphBuilder,
  loadYamlGraphSpecFile,
} from '../graph';

import {createSimplifier} from '../setops';
import {firewallSpec} from '../specs';
import {fail, handleError, succeed} from '../utilities';

function main() {
  const args = minimist(process.argv.slice(2));

  if (args.h || args.help) {
    showUsage();
    return succeed(false);
  }

  if (args._.length !== 1) {
    return fail('Error: expected a <network.yaml> file.');
  }

  if (args.c) {
    return fail('Cycle detection not implemented.');
  }

  const modelSpoofing = !!args.s;
  const showRouters = !!args.r;
  const verbose = !!args.v;
  const showPaths = verbose || !!args.p;

  const options = {modelSpoofing, showPaths, showRouters, verbose};

  try {
    // Initialize universe.
    const universe = args.u
      ? Universe.fromYamlFile(args.u)!
      : new Universe(firewallSpec);
    const simplifier = createSimplifier<AnyRuleSpec>(universe);

    // Load network graph.
    const spec = loadYamlGraphSpecFile(args._[0]);
    const nodes = spec.nodes;
    const builder = new GraphBuilder(universe, simplifier, spec);
    const graph = builder.buildGraph();

    if (args.f) {
      /////////////////////////////////////////////////////////////////////////
      //
      // Paths from args.f
      //
      /////////////////////////////////////////////////////////////////////////
      if (!nodes.find(node => node.key === args.f)) {
        return fail(`Unknown start node ${args.f}`);
      }

      const outbound = true;
      const {cycles, flows} = graph.analyze(args.f, outbound, modelSpoofing);

      summarizeOptions(options);
      listEndpoints(graph, showRouters);

      if (cycles.length > 0) {
        console.log(`Cycles reachable from ${args.f}:`);
        for (const cycle of cycles) {
          console.log('  ' + graph.formatCycle(cycle, verbose));
          console.log();
        }
        console.log();
      }

      if (args.t) {
        if (!nodes.find(node => node.key === args.t)) {
          return fail(`Unknown end node ${args.t}`);
        }
      }

      if (args.t) {
        console.log(`Routes from ${args.f} to ${args.t}:`);
      } else {
        console.log(`Nodes reachable from ${args.f}:`);
      }
      console.log();

      for (const flow of flows) {
        if (
          args.f !== flow.node.spec.key &&
          (args.r || flow.node.isEndpoint || args.t === flow.node.key)
        ) {
          console.log(graph.formatFlow(flow, outbound, options));
          console.log();
        }
      }
    } else if (args.t) {
      /////////////////////////////////////////////////////////////////////////
      //
      // Paths to args.t
      //
      /////////////////////////////////////////////////////////////////////////
      if (!nodes.find(node => node.key === args.t)) {
        return fail(`Unknown end node ${args.t}`);
      }

      const outbound = false;
      const {cycles, flows} = graph.analyze(args.t, outbound, modelSpoofing);

      summarizeOptions(options);
      listEndpoints(graph, showRouters);

      if (cycles.length > 0) {
        console.log(`Cycles on paths to ${args.t}:`);
        for (const cycle of cycles) {
          console.log('  ' + graph.formatCycle(cycle));
          console.log();
        }
        console.log();
      }

      console.log(`Nodes that can reach ${args.t}:`);
      console.log();

      for (const flow of flows) {
        if (args.t !== flow.node.spec.key && (args.r || flow.node.isEndpoint)) {
          console.log(graph.formatFlow(flow, outbound, options));
          console.log();
        }
      }
    } else {
      return fail('Use the -f or -t option to specify a node for analysis.');
    }
  } catch (e) {
    handleError(e);
  }

  return succeed(true);
}

function showUsage() {
  const program = path.basename(process.argv[1]);

  const usage: Section[] = [
    {
      header: 'Network graph reachability analyzer',
      content: 'Utility for analyzing reachability in networks.',
    },
    {
      header: 'Usage',
      content: [`node ${program} {underline <network.yaml>} [...options]`],
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
        {
          name: 'cycles',
          alias: 'c',
          description: 'Find all cycles in the graph.',
          type: Boolean,
        },
        {
          name: 'paths',
          alias: 'p',
          description: 'Displays paths for each route.',
          type: Boolean,
        },
        {
          name: 'routers',
          alias: 'r',
          description: 'Display routers along paths.',
          type: Boolean,
        },
        {
          name: 'spoofing',
          alias: 's',
          description: 'Model source address spoofing.',
          type: Boolean,
        },
      ],
    },
  ];

  console.log(commandLineUsage(usage));
}

function listEndpoints(graph: Graph, showRouters: boolean) {
  if (showRouters) {
    console.log('Nodes:');
    for (const node of graph.nodes) {
      console.log(
        `  ${node.key}: ${node.range.format().slice(11)}${
          node.isEndpoint ? ' (endpoint)' : ''
        }`
      );
    }
  } else {
    console.log('Endpoints:');
    for (const node of graph.nodes) {
      if (node.isEndpoint) {
        console.log(`  ${node.key}: ${node.range.format().slice(11)}`);
      }
    }
  }
  console.log();
}

function summarizeOptions(options: {
  modelSpoofing: boolean;
  showPaths: boolean;
  showRouters: boolean;
  verbose: boolean;
}) {
  console.log('Options summary:');

  if (options.modelSpoofing) {
    console.log('  Modeling source ip address spoofing (-s).');
  } else {
    console.log(
      '  Not modeling source ip address spoofing (use -s flag to enable).'
    );
  }

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

  console.log();
}

main();
