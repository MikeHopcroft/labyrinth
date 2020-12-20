import {Universe} from '../dimensions';
import {createRandomPolicy, Random} from '../fuzzer';
import {denyOverrides, parseRuleSpec, Rule} from '../loaders';
import {simplify} from '../setops';
import {firewallSpec} from '../specs';


function go() {
  const universe = new Universe(firewallSpec);

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
    runTest(universe, rules1);
  }
}

function runTest(universe: Universe, rules: Rule[]) {
  const a0 = denyOverrides(universe.dimensions, rules);
  console.log(`  Conjunctions in a: ${a0.conjunctions.length}`);
  const a = simplify(universe.dimensions, a0);
  console.log(`  Conjunctions in a after simplification: ${a.conjunctions.length}`);

  const b = denyOverrides(universe.dimensions, rules, { simplify: true });
  console.log(`  Conjunctions in b: ${b.conjunctions.length}`);

  const aSubB = a.subtract2(universe.dimensions, b);
  console.log(`  aSubB empty: ${aSubB.isEmpty()}`);

  const bSubA = b.subtract2(universe.dimensions, a);
  console.log(`  bSubA empty: ${bSubA.isEmpty()}`);
}

go();

