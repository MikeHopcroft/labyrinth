import commandLineUsage from 'command-line-usage';
import {Section} from 'command-line-usage';
import minimist from 'minimist';
import path from 'path';

import {Universe} from '../dimensions';
import {ForwardRuleSpecEx, GraphBuilder, loadYamlNodeSpecsFile} from '../graph';
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

  if (args.p) {
    return fail('Partition detection not implemented.');
  }

  const verbose = !!args.v;

  try {
    // Initialize universe.
    const universe = args.u
      ? Universe.fromYamlFile(args.u)!
      : new Universe(firewallSpec);
    const simplifier = createSimplifier<ForwardRuleSpecEx>(universe);

    // Load network graph.
    const nodes = loadYamlNodeSpecsFile(args._[0]);
    const builder = new GraphBuilder(universe, simplifier, nodes);
    const graph = builder.buildGraph();

    if (args.f) {
      const outbound = true;
      if (!nodes.find(node => node.key === args.f)) {
        return fail(`Unknown start node ${args.f}`);
      }
      const {cycles, flows} = graph.analyze(args.f, outbound);

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
        console.log(`Routes from ${args.f}:`);
      }

      for (const flow of flows) {
        if (!args.t || args.t === flow.node.key)
          console.log(graph.formatFlow(flow, outbound, verbose));
          console.log();
        }
    } else if (args.t) {
      const outbound = false;
      if (!nodes.find(node => node.key === args.t)) {
        return fail(`Unknown end node ${args.t}`);
      }

      const {cycles, flows} = graph.analyze(args.t, outbound);

      if (cycles.length > 0) {
        console.log(`Cycles on paths to ${args.t}:`);
        for (const cycle of cycles) {
          console.log('  ' + graph.formatCycle(cycle));
          console.log();
        }
        console.log();
      }

      console.log(`Routes to ${args.t}:`);
      for (const flow of flows) {
        console.log(graph.formatFlow(flow, outbound, verbose));
        console.log();
      }
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
          name: 'partitions',
          alias: 'p',
          description: 'Find all partitions of the graph.',
          type: Boolean,
        },
      ],
    },
  ];

  console.log(commandLineUsage(usage));
}

main();
