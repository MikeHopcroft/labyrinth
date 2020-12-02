import commandLineUsage from 'command-line-usage';
import {Section} from 'command-line-usage';
import minimist from 'minimist';
import path from 'path';

import {Universe} from '../dimensions';
import {denyOverrides, firstApplicable, loadRulesFile, Rule} from '../rules';
import {Disjunction, simplify} from '../setops';
import {firewallSpec} from '../specs';
import {fail, handleError, succeed} from '../utilities';

function main() {
  const args = minimist(process.argv.slice(2));

  if (args.h || args.help) {
    showUsage();
    return succeed(false);
  }

  if (args._.length !== 1) {
    return fail('Error: expected a <rules.yaml> file.');
  }

  try {
    let evaluator: (rules: Rule[]) => Disjunction;
    if (args.m === 'firstApplicable' || args.m === 'f') {
      console.log('Mode is firstApplicable.');
      evaluator = firstApplicable;
    } else if (
      args.m === undefined ||
      args.m === 'denyOverrides' ||
      args.m === 'd'
    ) {
      console.log('Mode is denyOverrides.');
      evaluator = firstApplicable;
    } else {
      const message = `Unsupported mode "${args.m}".`;
      throw new TypeError(message);
    }
    console.log();

    // Initialize universe.
    const universe = args.u
      ? Universe.fromYamlFile(args.u)!
      : new Universe(firewallSpec);

    // Load rules1.
    const rules1 = loadRulesFile(universe, args._[0]);
    const r1 = simplify(universe.dimensions, evaluator(rules1));

    if (args.c) {
      const rules2 = loadRulesFile(universe, args.c);
      const r2 = simplify(universe.dimensions, evaluator(rules2));

      const r1SubR2 = simplify(universe.dimensions, r1.subtract(r2));
      const r2SubR1 = simplify(universe.dimensions, r2.subtract(r1));
      const r1AndR2 = simplify(universe.dimensions, r1.intersect(r2));

      if (r1SubR2.isEmpty() && r2SubR1.isEmpty()) {
        console.log('Rule sets r1 and r2 are equivalent');
      } else {
        if (r1SubR2.isEmpty()) {
          console.log('All routes in policy are also in contract.');
        } else {
          console.log('Routes in policy that are not in contract:');
          console.log(r1SubR2.format('  '));
        }
        console.log();

        if (r2SubR1.isEmpty()) {
          console.log('All routes in contract are also in policy.');
        } else {
          console.log('Routes in contract that are not in policy:');
          console.log(r2SubR1.format('  '));
        }
        console.log();

        if (r1AndR2.isEmpty()) {
          console.log('Policy and contract have no routes in common.');
        } else {
          console.log('Routes common to policy and contract:');
          console.log(r1AndR2.format('  '));
        }
      }
      console.log();
    } else {
      console.log('Allowed routes:');
      console.log(r1.format('  '));
      console.log();
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
      header: 'Network rule analysis tool',
      content: 'Utility for analyzing network security rules.',
    },
    {
      header: 'Usage',
      content: [`node ${program} {underline <rules>} [...options]`],
    },
    {
      header: 'Required Parameters',
      content: [
        {
          name: '{underline <rules>}',
          summary:
            'Path to a csv, txt, or yaml file the defines a set of rules.',
        },
      ],
    },
    {
      header: 'Options',
      optionList: [
        {
          name: 'contract',
          alias: 'c',
          typeLabel: '{underline <contract>}',
          description:
            'Compare the rule set in {underline <contract>} with those in {underline <rules>}.\n',
        },
        {
          name: 'mode',
          alias: 'm',
          typeLabel: '{underline <mode>}',
          description:
            'Defines the rule evaluation strategy. Choices are {underline denyOverrides}' +
            'and {underline firstApplicable}. Defaults to {underline denyOverrides}.',
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
          name: 'telemetry',
          alias: 't',
          description: 'Display telemetry on boolean expression complexity.',
          type: Boolean,
        },
      ],
    },
  ];

  console.log(commandLineUsage(usage));
}

main();
