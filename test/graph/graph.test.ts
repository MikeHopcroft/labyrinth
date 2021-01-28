import {assert} from 'chai';
import 'mocha';

import {Universe} from '../../src/dimensions';

import {
  ForwardRuleSpecEx,
  Graph,
  GraphBuilder,
  NodeSpec,
} from '../../src/graph';

import {createSimplifier} from '../../src/setops';
import {firewallSpec} from '../../src/specs';

const universe = new Universe(firewallSpec);
const simplifier = createSimplifier<ForwardRuleSpecEx>(universe);

describe('Graph2', () => {
  describe('errors', () => {
    it('unknown destination', () => {
      const nodes: NodeSpec[] = [
        {
          name: 'internet',
          key: 'internet',
          rules: [
            {
              destination: 'bad_key',
            },
          ],
        },
      ];
      const builder = new GraphBuilder(universe, simplifier, nodes);
      assert.throws(() => {
        const graph = builder.buildGraph();
      }, 'Unknown node "bad_key".');
    });

    it('duplicate node key', () => {
      const nodes: NodeSpec[] = [
        {
          name: 'internet',
          key: 'internet',
          rules: [
            {
              destination: 'bad_key',
            },
          ],
        },
        {
          name: 'internet',
          key: 'internet',
          rules: [
            {
              destination: 'bad_key',
            },
          ],
        },
      ];
      assert.throws(() => {
        const builder = new GraphBuilder(universe, simplifier, nodes);
      }, 'Duplicate node key "internet".');
    });
  });

  describe('cycles', () => {
    it('simple cycle', () => {
      const nodes: NodeSpec[] = [
        {
          name: 'internet',
          key: 'internet',
          rules: [
            {
              destination: 'a',
            },
          ],
        },
        {
          name: 'a',
          key: 'a',
          rules: [
            {
              destination: 'b',
            },
          ],
        },
        {
          name: 'b',
          key: 'b',
          rules: [
            {
              destination: 'c',
            },
          ],
        },
        {
          name: 'c',
          key: 'c',
          rules: [
            {
              destination: 'a',
            },
          ],
        },
      ];
      const builder = new GraphBuilder(universe, simplifier, nodes);
      const graph = builder.buildGraph();
      const {cycles, flows} = graph.analyze('internet', true);
      assert.equal(cycles.length, 1);
      const c = graph.formatCycle(cycles[0]);
      assert.equal(c, 'a => b => c => a');
    });

    // Loopback to endpoint is not a cycle
    it('Loopback to endpoint is not a cycle', () => {
      const nodes: NodeSpec[] = [
        {
          name: 'internet',
          key: 'internet',
          endpoint: true,
          rules: [
            {
              destination: 'a',
            },
          ],
        },
        {
          name: 'a',
          key: 'a',
          rules: [
            {
              destination: 'b',
            },
          ],
        },
        {
          name: 'b',
          key: 'b',
          rules: [
            {
              destination: 'c',
            },
          ],
        },
        {
          name: 'c',
          key: 'c',
          rules: [
            {
              destination: 'internet',
            },
          ],
        },
      ];
      const builder = new GraphBuilder(universe, simplifier, nodes);
      const graph = builder.buildGraph();
      const {cycles, flows} = graph.analyze('internet', true);
      assert.equal(cycles.length, 0);
    });
  });

  // Forward propagate
  describe('Forward propagate', () => {
    it('Simple', () => {
      const nodes: NodeSpec[] = [
        {
          name: 'internet',
          key: 'internet',
          endpoint: true,
          rules: [
            {
              destination: 'gateway',
            },
          ],
        },
        {
          name: 'gateway',
          key: 'gateway',
          rules: [
            {
              destination: 'subnet1',
              destinationIp: '10.0.0.0/8',
            },
            {
              destination: 'subnet2',
              destinationIp: '10.0.0.0/7',
            },
          ],
        },
        {
          name: 'subnet1',
          key: 'subnet1',
          rules: [
            {
              destination: 'subnet2',
              destinationPort: '80',
            },
            {
              destination: 'subnet3',
            },
          ],
        },
        {
          name: 'subnet2',
          key: 'subnet2',
          rules: [
            {
              destination: 'server',
              protocol: 'tcp',
            },
          ],
        },
        {
          name: 'subnet3',
          key: 'subnet3',
          rules: [],
        },
        {
          name: 'server',
          key: 'server',
          endpoint: true,
          rules: [],
        },
      ];

      const builder = new GraphBuilder(universe, simplifier, nodes);
      const graph = builder.buildGraph();
      // TODO: test reverse flows, format reverse flows
      const outbound = true;
      const {cycles, flows} = graph.analyze('internet', outbound);
      // const {cycles, flows} = graph.analyze('subnet3', false);

      assert.equal(cycles.length, 0);
      for (const [i, flow] of flows.entries()) {
        console.log(graph.formatFlow(flows[i], outbound));
      }
      console.log();
    });
  });

  // Backward propagate
  // server => subnet => server | internet
  // Builder - add, remove, update
});
