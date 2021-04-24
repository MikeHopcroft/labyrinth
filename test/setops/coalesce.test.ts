import {assert} from 'chai';
import 'mocha';

import {Universe, UniverseSpec} from '../../src/dimensions';
import {Constraint, parseConjunction} from '../../src/rules';
import {coalesce, Disjunction} from '../../src/setops';

const universeSpec: UniverseSpec = {
  types: [
    {
      name: 'ip address',
      key: 'ip',
      parser: 'ip',
      formatter: 'ip',
      domain: '0.0.0.0-255.255.255.255',
      values: [],
    },
    {
      name: 'port',
      key: 'port',
      parser: 'default',
      formatter: 'default',
      domain: '00-0xffff',
      values: [],
    },
    {
      name: 'protocol',
      key: 'protocol',
      parser: 'default',
      formatter: 'default',
      domain: '00-0xff',
      values: [
        {symbol: 'TCP', range: '6'},
        {symbol: 'UDP', range: '17'},
      ],
    },
  ],
  dimensions: [
    {
      name: 'source ip',
      key: 'sourceIp',
      type: 'ip',
    },
    {
      name: 'source port',
      key: 'sourcePort',
      type: 'port',
    },
    {
      name: 'destination ip',
      key: 'destinationIp',
      type: 'ip',
    },
    {
      name: 'destination port',
      key: 'destinationPort',
      type: 'port',
    },
    {
      name: 'protocol',
      key: 'protocol',
      type: 'protocol',
    },
  ],
};

const universe = new Universe(universeSpec);

const xxx: Constraint = {};

const axx: Constraint = {
  sourceIp: '1.1.1.1',
};

const xbx: Constraint = {
  destinationIp: '2.2.2.2',
};

const xxc: Constraint = {
  protocol: 'TCP',
};

const abx: Constraint = {
  sourceIp: '1.1.1.1',
  destinationIp: '2.2.2.2',
};

// const axc: Constraint = {
//   sourceIp: '1.1.1.1',
//   protocol: 'TCP',
// };

// const xbc: Constraint = {
//   destinationIp: '2.2.2.2',
//   protocol: 'TCP',
// };

const abc: Constraint = {
  sourceIp: '1.1.1.1',
  destinationIp: '2.2.2.2',
  protocol: 'TCP',
};

// const dxx: Constraint = {
//   sourceIp: '3.3.3.3',
// };

const dex: Constraint = {
  sourceIp: '3.3.3.3',
  destinationIp: '4.4.4.4',
};

const def: Constraint = {
  sourceIp: '3.3.3.3',
  destinationIp: '4.4.4.4',
  protocol: 'UDP',
};

describe('Coalesce', () => {
  it('dedupe three', () => {
    const input = Disjunction.create<number>(
      [axx, xbx, xxc, def, axx, xbx, def].map(spec =>
        parseConjunction(universe, spec, 1)
      )
    );

    const expected = Disjunction.create<number>(
      [axx, xbx, xxc, def].map(spec => parseConjunction(universe, spec, 1))
    );

    const output = coalesce(universe.dimensions, input);

    assert.sameDeepMembers(output.conjunctions, expected.conjunctions);
  });

  it('coalesce three terms', () => {
    const input = Disjunction.create<number>(
      [axx, abx, abc, def].map(spec => parseConjunction(universe, spec, 1))
    );

    const expected = Disjunction.create<number>(
      [axx, def].map(spec => parseConjunction(universe, spec, 1))
    );

    const output = coalesce(universe.dimensions, input);

    assert.sameDeepMembers(output.conjunctions, expected.conjunctions);
  });

  it('coalesce two and three', () => {
    const input = Disjunction.create<number>(
      [axx, abx, abc, def, dex].map(spec => parseConjunction(universe, spec, 1))
    );

    const expected = Disjunction.create<number>(
      [axx, dex].map(spec => parseConjunction(universe, spec, 1))
    );

    const output = coalesce(universe.dimensions, input);

    assert.sameDeepMembers(output.conjunctions, expected.conjunctions);
  });

  it('no coalesce', () => {
    const input = Disjunction.create<number>(
      [axx, xbx, xxc, def].map(spec => parseConjunction(universe, spec, 1))
    );

    const expected = Disjunction.create<number>(
      [axx, xbx, xxc, def].map(spec => parseConjunction(universe, spec, 1))
    );

    const output = coalesce(universe.dimensions, input);

    assert.sameDeepMembers(output.conjunctions, expected.conjunctions);
  });

  it('no coalesce - empty', () => {
    const input = Disjunction.create<number>(
      [].map(spec => parseConjunction(universe, spec, 1))
    );

    const expected = Disjunction.create<number>(
      [].map(spec => parseConjunction(universe, spec, 1))
    );

    const output = coalesce(universe.dimensions, input);

    assert.sameDeepMembers(output.conjunctions, expected.conjunctions);
  });

  it('annihilate', () => {
    const input = Disjunction.create<number>(
      [xxx, abc, def].map(spec => parseConjunction(universe, spec, 1))
    );

    const expected = Disjunction.create<number>(
      [xxx].map(spec => parseConjunction(universe, spec, 1))
    );

    const output = coalesce(universe.dimensions, input);

    assert.sameDeepMembers(output.conjunctions, expected.conjunctions);
  });
});
