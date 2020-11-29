import {Universe} from '../dimensions';
import {Conjunction, Disjunction, simplify} from '../setops';

import {ActionType, Rule} from './types';

interface Stage {
  deny: Disjunction;
  allow: Disjunction;
}

export function firstApplicable(
  rules: Rule[],
): Disjunction { 
  return buildExpression(0, rules);
}

export function buildExpression(index: number, rules: Rule[]): Disjunction {
  if (index === rules.length) {
    return Disjunction.create([]);
  } else {
    const rest = buildExpression(index + 1, rules);
    const r = rules[index];
    if (r.action === ActionType.DENY) {
      return r.conjunction.complement().intersect(rest);
    } else if (r.action === ActionType.ALLOW) {
      return Disjunction.create([r.conjunction]).union(rest);
    } else {
      const message = `Illegal action: ${r.action}.`;
      throw new TypeError(message);
    }
  }
}


export function firstApplicableOld3(universe: Universe, rules: Rule[]): Disjunction {
  const stages: Stage[] = [];

  let i = 0;
  while (i < rules.length) {
    let deny = Disjunction.create([Conjunction.create([])]);
    const di = i;
    while (i < rules.length && rules[i].action === ActionType.DENY) {
      const r = rules[i];
      deny = deny.intersect(r.conjunction.complement());
      ++i;
    }
    console.log(`${di}-${i}: DENY`);
    console.log(deny.format('  '));

    let allow = Disjunction.create([]);
    const si = i;
    while (i < rules.length && rules[i].action === ActionType.ALLOW) {
      const r = rules[i];
      allow = allow.union(Disjunction.create([r.conjunction]));
      ++i;
    }
    allow = simplify(universe.dimensions, allow);
    console.log(`${si}-${i}: ALLOW`);
    console.log(allow.format('  '));

    console.log('PUSH');
    stages.push({deny, allow});
  }

  return simplify(universe.dimensions, buildExpressionOld2(0, stages));
}

export function firstApplicableOld2(universe: Universe, rules: Rule[]): Disjunction {
  const stages: Stage[] = [];

  let i = 0;
  while (i < rules.length) {
    let deny: Disjunction;
    if (i < rules.length && rules[i].action === ActionType.DENY) {
      console.log(`${i}: DENY`);
      console.log(rules[i].conjunction.format('    '));
      deny = rules[i].conjunction.complement();
      console.log('  becomes');
      console.log(deny.format('    '));
      ++i;
    } else {
      deny = Disjunction.create([]);
    }
    // let d = Conjunction.create([]);
    // while (i < rules.length && rules[i].action === ActionType.DENY) {
    //   const r = rules[i];
    //   d = d.intersect(r.conjunction);
    //   ++i;
    // }
    // const deny = d.complement();
    // Disjunction.create([d]);

    let allow = Disjunction.create([]);
    while (i < rules.length && rules[i].action === ActionType.ALLOW) {
      const r = rules[i];
      allow = allow.union(Disjunction.create([r.conjunction]));
      ++i;
    }
    allow = simplify(universe.dimensions, allow);

    stages.push({deny, allow});
  }

  return simplify(universe.dimensions, buildExpressionOld2(0, stages));
}

export function firstApplicableOld(universe: Universe, rules: Rule[]): Disjunction {
  const stages: Stage[] = [];

  let i = 0;
  while (i < rules.length) {
    // if (i < rules.length && rules[i].action === ActionType.DENY) {
    //   ++i;
    // }
    let d = Conjunction.create([]);
    while (i < rules.length && rules[i].action === ActionType.DENY) {
      const r = rules[i];
      d = d.intersect(r.conjunction);
      ++i;
    }
    const deny = d.complement();
    // Disjunction.create([d]);

    let allow = Disjunction.create([]);
    while (i < rules.length && rules[i].action === ActionType.ALLOW) {
      const r = rules[i];
      allow = allow.union(Disjunction.create([r.conjunction]));
      ++i;
    }
    allow = simplify(universe.dimensions, allow);

    stages.push({deny, allow});
  }

  return simplify(universe.dimensions, buildExpressionOld2(0, stages));
}

export function buildExpressionOld2(index: number, stages: Stage[]): Disjunction {
  if (index === stages.length) {
    return Disjunction.create([]);
  } else {
    const rest = buildExpressionOld2(index + 1, stages);
    const s = stages[index];
    const result = s.deny.intersect(s.allow.union(rest));
    return result;
  }
}

export function buildExpressionOld(index: number, stages: Stage[]): Disjunction {
  if (index === stages.length) {
    return Disjunction.create([Conjunction.create([])]);
  } else {
    const s = stages[index];
    const left = s.deny.intersect(s.allow);
    const right = left.intersect(buildExpressionOld(index + 1, stages));

    console.log(`buildExpression: ${index}`);
    console.log('  left');
    console.log(left.format('    '));
    console.log('  right');
    console.log(right.format('    '));
    const result = left.union(right);
    console.log('  result');
    console.log(result.format('    '));
    return result;
  }
}
