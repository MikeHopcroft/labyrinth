// Express app for performance testing with Chrome V8 dev tools.
// Needs express and @types/express.

// import express from 'express';

// import {Universe} from '../dimensions';
// import {createRandomPolicy, Random, Stopwatch} from '../fuzzer';
// import {denyOverrides, parseRuleSpec} from '../loaders';
// import {RuleSpec} from '../setops';
// import {simplify2} from '../simplifier';
// import {firewallSpec} from '../specs';


// function go() {
//   const universe = new Universe(firewallSpec);
//   const random = new Random('1234');
//   const {rules} = createRandomPolicy(universe, 3, 0.6, random);

//   const app = express()
//   const port = 3000
  
//   app.get('/', (req, res) => {
//     console.log('Start');
//     const elapsedTime = runTest(universe, rules);
//     console.log(`Completed in ${elapsedTime}`);
//     res.send(`Completed in ${elapsedTime}`);
//   })
  
//   app.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`)
//   })
// }

// function runTest(universe: Universe, rules: RuleSpec[]): string {
//   const rules1 = rules.map(r => parseRuleSpec(universe, r));
//   const r1Original = denyOverrides(rules1);

//   const stopwatch = new Stopwatch();
//   const simplified = simplify2(universe.dimensions, r1Original);
//   return stopwatch.format();
// }

// go();

