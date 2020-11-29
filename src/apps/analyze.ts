import commandLineUsage from 'command-line-usage';
import { Section } from 'command-line-usage';
// import * as dotenv from 'dotenv';
import minimist from 'minimist';
import path from 'path';
import {firewallSpec} from '../specs';

import {Universe} from '../dimensions';
import {denyOverrides, firstApplicable, loadRulesFile} from '../rules';
import {simplify} from '../setops';
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
    console.log('Do something');

    // Initialize universe.
    const universe = (args.u) ?
      Universe.fromYamlFile(args.u)!:
      new Universe(firewallSpec);

    // Load rules1.
    const rules1 = loadRulesFile(universe, args._[0]);
    // TODO: BUGBUG: first call to simplify should have resulted in
    // simplest form, so that second call would find no further simplications.
    const r1a = simplify(universe.dimensions, firstApplicable(rules1));
    const r1 = simplify(universe.dimensions, r1a);
    // const r1 = simplify(universe.dimensions, denyOverrides(rules1));

    if (args.c) {
      const rules2 = loadRulesFile(universe, args.c);
      const r2 = simplify(universe.dimensions, firstApplicable(rules2));
      // const r2 = simplify(universe.dimensions, denyOverrides(rules2));

      const r1SubR2 = simplify(universe.dimensions, r1.subtract(r2));
      const r2SubR1 = simplify(universe.dimensions, r2.subtract(r1));
      const r1AndR2 = simplify(universe.dimensions, r1.intersect(r2));

      if (r1SubR2.isEmpty() && r2SubR1.isEmpty()) {
        console.log('Rule sets r1 and r2 are equivalent');
      } else {
        if (r1SubR2.isEmpty()) {
          console.log('All routes in r1 are also in r2.');
        } else {
          console.log('Routes in r1 that are not in r2:');
          console.log(r1SubR2.format('  '));
        }
        console.log();

        if (r2SubR1.isEmpty()) {
          console.log('All routes in r2 are also in r1.');
        } else {
          console.log('Routes in r2 that are not in r1:');
          console.log(r2SubR1.format('  '));
        }
        console.log();

        if (r1AndR2.isEmpty()) {
          console.log('Rule sets r1 and r2 have no routes in common.');
        } else {
          console.log('Routes common to r1 and r2:');
          console.log(r1AndR2.format('  '));
        }
      }
      console.log();
    } else if (args.v) {
      console.log('Not implemented');
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

// function loadRules(file: string): Rule[] {
//   console.log(`Load rules from "${file}".`);
//   return [];
// }

function showUsage() {
  const program = path.basename(process.argv[1]);

  const usage: Section[] = [
    {
      header: 'Network rule analysis tool',
      content: `Utility for analyzing network security rules.`,
    },
    {
      header: 'Usage',
      content: [
        `node ${program} {underline <rules.yaml>} [...options]`,
      ],
    },
    {
      header: 'Required Parameters',
      content: [
        {
          name: '{underline <rules.yaml>}',
          summary:
            'Path to a YAML file the defines a set of rules.',
        },
      ],
    },
    {
      header: 'Options',
      optionList: [
        {
          name: 'compare',
          alias: 'c',
          typeLabel: '{underline <other.yaml>}',
          description:
            `Compare the rule set in {underline <other.yaml>} with those in {underline <rules.yaml>}.\n`,
          // type: Boolean,
        },
        {
          name: 'verify',
          alias: 'v',
          typeLabel: '{underline <other.yaml>}',
          description:
            `Verify the rule set in {underline <other.yaml>} is a subset of those in {underline <rules.yaml>}.\n`,
          // type: Boolean,
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
          description: `Display telemetry on boolean expression complexity.`,
          type: Boolean,
        },

      ],
    },
  ];

  console.log(commandLineUsage(usage));
}

main();

