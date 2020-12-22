import {Universe} from '../dimensions';
import {createRandomPolicy, Random} from '../fuzzer';

import {
  denyOverrides,
  parseRuleSpec,
  Rule,
  RuleSpec
} from '../loaders';

import {createSimplifier, Simplifier} from '../setops';
import {firewallSpec} from '../specs';

function go() {
  const universe = new Universe(firewallSpec);
  const simplifier = createSimplifier<RuleSpec>(universe);

  // This version fails on iteration 7
  // First differs on iteration 6
  // const random = new Random('1234');

  for (let i = 1; i < 23; ++i) {
    console.log(`Rule count ${i}`);

    // This version fails on iteration 13
    // First differs on iteration 11
    const random = new Random('1234');

    const {rules} = createRandomPolicy(universe, i, 0.6, random);
    const rules1 = rules.map(r => parseRuleSpec(universe, r));
    runTest(rules1, simplifier);
  }
}

function runTest(rules: Rule[], simplifier: Simplifier<RuleSpec>) {
  const a0 = denyOverrides(rules, simplifier);
  console.log(`  Conjunctions in a: ${a0.conjunctions.length}`);
  const a = simplifier(a0);
  console.log(
    `  Conjunctions in a after simplification: ${a.conjunctions.length}`
  );

  const b = denyOverrides(rules, simplifier);
  console.log(`  Conjunctions in b: ${b.conjunctions.length}`);

  const aSubB = a.subtract(b, simplifier);
  console.log(`  aSubB empty: ${aSubB.isEmpty()}`);

  const bSubA = b.subtract(a, simplifier);
  console.log(`  bSubA empty: ${bSubA.isEmpty()}`);
}

go();
