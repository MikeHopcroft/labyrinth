import commandLineUsage from 'command-line-usage';
import {Section} from 'command-line-usage';
import minimist from 'minimist';
import path from 'path';

import {Universe} from '../dimensions';

import {
  createRandomPolicy,
  expressionStatistics,
  policyStatistics,
  Random,
  Stopwatch,
} from '../fuzzer';

import {
  createSimplifier,
  denyOverrides,
  detectRedundantRules,
  Evaluator,
  firstApplicable,
  parseRuleSpec,
} from '../loaders';

import {
  FormatAttribution,
  formatRules,
  FormattingOptions,
  simplify,
} from '../setops';

import {firewallSpec} from '../specs';
import {fail, handleError, succeed} from '../utilities';

function main() {
  const stopwatch = new Stopwatch();
  const args = minimist(process.argv.slice(2));

  if (args.h || args.help) {
    showUsage();
    return succeed(false);
  }

  if (args._.length > 0) {
    return fail('Error: unexpected command line argument.');
  }

  try {
    let evaluator: Evaluator;
    if (args.m === 'firstApplicable' || args.m === 'f') {
      console.log('Mode is firstApplicable.');
      evaluator = firstApplicable;
    } else if (
      args.m === undefined ||
      args.m === 'denyOverrides' ||
      args.m === 'd'
    ) {
      console.log('Mode is denyOverrides.');
      evaluator = denyOverrides;
    } else {
      const message = `Unsupported mode "${args.m}".`;
      throw new TypeError(message);
    }
    console.log();

    const formatOptions: FormattingOptions = {
      prefix: '  ',
    };
    if (args.a === 'id') {
      formatOptions.attribution = FormatAttribution.RULE_ID;
    } else if (args.a === 'line' || args.a === true) {
      formatOptions.attribution = FormatAttribution.LINE_NUMBER;
    } else if (args.a) {
      const message = `Unknown attribution option "${args.a}"`;
      throw new TypeError(message);
    }

    // Initialize universe.
    const universe = args.u
      ? Universe.fromYamlFile(args.u)!
      : new Universe(firewallSpec);
    const simplifier = createSimplifier(universe);

    // Generate rules
    const defaultRuleCount = 10;
    const ruleCount = args.n ? Number(args.n) : defaultRuleCount;
    if (isNaN(ruleCount)) {
      fail(`Expected a number for the -n argument.`);
    }

    const defaultP = 0.1;
    const p = args.p ? Number(args.p) : defaultP;
    if (isNaN(p)) {
      fail(`Expected a number for the -p argument.`);
    }

    const random = new Random('1234');
    const {rules} = createRandomPolicy(universe, ruleCount, p, random);
    console.log(JSON.stringify(rules, null, 2));

    console.log(policyStatistics(universe, rules));

    const rules1 = rules.map(r => parseRuleSpec(universe, r));
    // console.log(`after parseRuleSpec()`);
    console.log(`Before evaluation: ${stopwatch.format()}`);
    stopwatch.reset();
    const r1Original = evaluator(rules1, simplifier);
    console.log(`Before simplification: ${stopwatch.format()}`);
    const before = expressionStatistics(universe, r1Original);
    console.log(before);
    // const stopwatch = new Stopwatch();
    stopwatch.reset();
    const r1 = simplify(universe.dimensions, r1Original);
    // const r1 = simplify(universe.dimensions, simplify(universe.dimensions, r1Original));
    const time = stopwatch.format();
    console.log(`Time for simplification: ${time}`);
    console.log('After simplification:');
    const after = expressionStatistics(universe, r1);
    console.log(after);

    if (args.c) {
      console.log('============ Contract Validation Report ============');

      // const rules2 = rules1; //loadRulesFile(universe, args.c, {source: 'contract'});
      stopwatch.reset();
      const r2 = simplify(universe.dimensions, r1Original);
      const time = stopwatch.format();
      console.log(`Time for simplification: ${time}`);
  
      const r1SubR2 = r1.subtract(r2, simplifier);
      const r2SubR1 = r2.subtract(r1, simplifier);
      const r1AndR2 = r1.intersect(r2);

      if (r1SubR2.isEmpty() && r2SubR1.isEmpty()) {
        console.log('The policy and contract are equivalent');
      } else {
        if (r1SubR2.isEmpty()) {
          console.log('All routes in policy are also in contract.');
        } else {
          console.log('Routes in policy that are not in contract:');
          console.log(r1SubR2.format(formatOptions));
        }
        console.log();

        if (r2SubR1.isEmpty()) {
          console.log('All routes in contract are also in policy.');
        } else {
          console.log('Routes in contract that are not in policy:');
          console.log(r2SubR1.format(formatOptions));
        }
        console.log();

        if (r1AndR2.isEmpty()) {
          console.log('Policy and contract have no routes in common.');
        } else {
          console.log('Routes common to policy and contract:');
          console.log(r1AndR2.format(formatOptions));
        }
      }
      console.log();
    } else {
      console.log('============ Policy Report ============');
      console.log('Allowed routes:');
      console.log(r1.format(formatOptions));
      console.log();

      console.log(policyStatistics(universe, rules));
      console.log();
      console.log('Before simplification:');
      console.log(before);
      console.log();
      console.log(`Time for simplification: ${time}`);
      console.log();
      console.log('After simplification:');
      console.log(after);
    }

    if (args.r) {
      console.log('============ Redundant Rules Report ============');
      const policySpecs = detectRedundantRules(evaluator, rules1, simplifier);
      console.log(`Redundant ${formatRules(new Set(policySpecs))}`);
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
        // {
        //   name: 'attribution',
        //   alias: 'a',
        //   typeLabel: '{underline line|id}',
        //   description: 'Display rules attribution.',
        // },
        // {
        //   name: 'contract',
        //   alias: 'c',
        //   typeLabel: '{underline <contract>}',
        //   description:
        //     'Compare the rule set in {underline <contract>} with those in {underline <rules>}.\n',
        // },
        {
          name: 'mode',
          alias: 'm',
          typeLabel: '{underline <mode>}',
          description:
            'Defines the rule evaluation strategy. Choices are {underline denyOverrides} (or {underline d}) ' +
            'and {underline firstApplicable} (or {underline f}). Defaults to {underline denyOverrides}.',
        },
        {
          name: 'number',
          alias: 'n',
          typeLabel: '{underline <rule count>}',
          description:
            'Specifies the number of synthetic rules to generate',
        },
        {
          name: 'probability',
          alias: 'p',
          typeLabel: '{underline <probability>}',
          description:
            'Specifies the probability for including each additional dimension contraint after the first.',
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
        // {
        //   name: 'reduncancy',
        //   alias: 'r',
        //   description: 'Display list of redundant policy rules.',
        //   type: Boolean,
        // },
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
