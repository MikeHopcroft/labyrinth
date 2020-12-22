import {assert} from 'chai';
import 'mocha';

import {Universe} from '../../src/dimensions';
import {ForwardRuleSpecEx, Graph, GraphSpec} from '../../src/graph';
import {createSimplifier} from '../../src/setops';
import {firewallSpec} from '../../src/specs';

const universe = new Universe(firewallSpec);
const simplifier = createSimplifier<ForwardRuleSpecEx>(universe);

describe('Graph', () => {
  describe('errors', () => {
    it('unknown destination', () => {
      const spec: GraphSpec = {
        nodes: [
          {
            name: 'internet',
            key: 'internet',
            rules: [
              {
                destination: 'bad_key'
              },
            ]
          },
        ]
      }
      assert.throws(
        () => {
          const graph = new Graph(universe, spec, simplifier);
        },
        'Unknown node "bad_key".'
      );
    });
  
    it('duplicate node key', () => {
      const spec: GraphSpec = {
        nodes: [
          {
            name: 'internet',
            key: 'internet',
            rules: [
              {
                destination: 'bad_key'
              },
            ]
          },
          {
            name: 'internet',
            key: 'internet',
            rules: [
              {
                destination: 'bad_key'
              },
            ]
          },
        ]
      }
      assert.throws(
        () => {
          const graph = new Graph(universe, spec, simplifier);
        },
        'Duplicate node key "internet".'
      );
    });
  
    describe('cycle detection', () => {
      it('incomplete propagation', () => {
        const spec: GraphSpec = {
          nodes: [
            {
              name: 'internet',
              key: 'internet',
              rules: [
                {
                  destination: 'a'
                },
              ]
            },
            {
              name: 'a',
              key: 'a',
              rules: [
                {
                  destination: 'b'
                },
              ]
            },
            {
              name: 'b',
              key: 'b',
              rules: [
                {
                  destination: 'a'
                },
              ]
            },
          ]
        }
        assert.throws(
          () => {
            const graph = new Graph(universe, spec, simplifier);
          },
          'Graph contains a cycle.'
        );
      });
  
      it('cycle prevents propagation', () => {
        const spec: GraphSpec = {
          nodes: [
            {
              name: 'internet',
              key: 'internet',
              rules: [
                {
                  destination: 'a'
                },
              ]
            },
            {
              name: 'a',
              key: 'a',
              rules: [
                {
                  destination: 'b'
                },
              ]
            },
            {
              name: 'b',
              key: 'b',
              rules: [
                {
                  destination: 'internet'
                },
              ]
            },
          ]
        }
        assert.throws(
          () => {
            const graph = new Graph(universe, spec, simplifier);
          },
          'Cycle detected at graph root.'
        );
      });
    });
  });

  it('simple', () => {
    const spec: GraphSpec = {
      nodes: [
        {
          name: 'internet',
          key: 'internet',
          rules: [
            {
              destination: 'gateway'
            },
          ]
        },
        {
          name: 'gateway',
          key: 'gateway',
          rules: [
            {
              destination: 'subnet1',
              destinationIp: '10.0.0.0/8'
            },
            {
              destination: 'subnet2',
              destinationIp: '10.0.0.0/7'
            },
          ]
        },
        {
          name: 'subnet1',
          key: 'subnet1',
          rules: [
            {
              destination: 'subnet2',
              destinationPort: '80'
            },
            {
              destination: 'subnet3',
            },
          ]
        },
        {
          name: 'subnet2',
          key: 'subnet2',
          rules: [
            {
              destination: 'server',
              protocol: 'tcp'
            },
          ]
        },
        {
          name: 'subnet3',
          key: 'subnet3',
          rules: [
          ]
        },
        {
          name: 'server',
          key: 'server',
          rules: [
          ]
        },
      ]
    }

    const graph = new Graph(universe, spec, simplifier);
    console.log(graph.format());

    assert.fail();
  });

  it('confluence', () => {
    const spec: GraphSpec = {
      nodes: [
        {
          name: 'internet',
          key: 'internet',
          rules: [
            {
              destination: 'gateway'
            },
          ]
        },
        {
          name: 'gateway',
          key: 'gateway',
          rules: [
            {
              destination: 'subnet1',
              destinationIp: '10.0.0.0/8'
            },
            {
              destination: 'subnet2',
              destinationIp: '10.0.0.0/7'
            },
          ]
        },
        {
          name: 'subnet1',
          key: 'subnet1',
          rules: [
            {
              destination: 'final',
            },
          ]
        },
        {
          name: 'subnet2',
          key: 'subnet2',
          rules: [
            {
              destination: 'final',
            },
          ]
        },
        {
          name: 'final',
          key: 'final',
          rules: [
          ]
        },
      ]
    }

    const graph = new Graph(universe, spec, simplifier);
    console.log(graph.format());

    // TODO: the union operation in Node.forwardRoutes() should
    // simplify which will combine 11.0.0.0/8 and 10.0.0.0/8.

    assert.fail();
  });

});
