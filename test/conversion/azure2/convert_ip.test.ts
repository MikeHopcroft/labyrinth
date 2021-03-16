import {assert} from 'chai';
import 'mocha';

import {NodeSpec} from '../../../src';

import {convertIp} from '../../../src/conversion/azure2';

import {
  createGraphServicesMock,
  localIp1,
  localIp1SourceIp,
  publicIp1,
  publicIp1SourceIp,
  subnet1,
} from './sample_resource_graph';

export default function test() {
  describe('convertIp()', () => {
    it('local ip', () => {
      const {services} = createGraphServicesMock();

      // convertIp() expects to find its subnet spec in the index.
      services.index.add(subnet1);

      // DESIGN NOTE: cannot call services.convert.ip()  because our intent is
      // to test the real convertIp(), instead of its mock.
      const result = convertIp(services, localIp1);
      const {nodes: observedNodes} = services.getLabyrinthGraphSpec();

      // Verify the return value.
      assert.equal(result.destination, localIp1.id);
      assert.deepEqual(result.constraints, {destinationIp: localIp1SourceIp});

      // Verify the service tag definition.
      assert.deepEqual(services.symbols.getSymbolSpec(localIp1.id), {
        dimension: 'ip',
        symbol: localIp1.id,
        range: localIp1.properties.privateIPAddress,
      });

      // Verify that correct VNet node(s) were created in services.
      const expectedNodes: NodeSpec[] = [
        {
          key: localIp1.id,
          endpoint: true,
          range: {sourceIp: localIp1SourceIp},
          routes: [
            {
              // TODO: test shouldn't look inside of subnet's spec.
              destination: subnet1.id,
              constraints: {
                destinationIp: `except ${localIp1SourceIp}`,
              },
            },
          ],
        },
      ];

      assert.deepEqual(observedNodes, expectedNodes);
    });

    it('public ip', () => {
      const {services} = createGraphServicesMock();

      // convertIp() expects to find its subnet spec in the index.
      services.index.add(subnet1);

      // DESIGN NOTE: cannot call services.convert.ip()  because our intent is
      // to test the real convertIp(), instead of its mock.
      const result = convertIp(services, publicIp1);
      const {nodes: observedNodes} = services.getLabyrinthGraphSpec();

      // Verify the return value.
      assert.equal(result.destination, publicIp1.id);
      assert.deepEqual(result.constraints, {destinationIp: publicIp1SourceIp});

      // Verify the service tag definition.
      assert.deepEqual(services.symbols.getSymbolSpec(publicIp1.id), {
        dimension: 'ip',
        symbol: publicIp1.id,
        range: publicIp1.properties.ipAddress,
      });

      // Verify that correct VNet node(s) were created in services.
      const expectedNodes: NodeSpec[] = [
        {
          key: publicIp1.id,
          endpoint: true,
          range: {sourceIp: publicIp1SourceIp},
          routes: [
            {
              // TODO: test shouldn't look inside of subnet's spec.
              destination: subnet1.id,
              constraints: {
                destinationIp: `except ${publicIp1SourceIp}`,
              },
            },
          ],
        },
      ];

      assert.deepEqual(observedNodes, expectedNodes);
    });
  });
}
