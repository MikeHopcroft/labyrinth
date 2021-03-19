import {assert} from 'chai';
import 'mocha';

import {NodeSpec} from '../../../src';

import {convertIp} from '../../../src/conversion/azure';

import {
  createGraphServicesMock,
  privateIp1,
  privateIp1Id,
  privateIp1SourceIp,
  publicIp1,
  publicIp1Id,
  publicIp1SourceIp,
  subnet1,
} from './sample_resource_graph';

export default function test() {
  describe('convertIp()', () => {
    it('private ip', () => {
      const {services} = createGraphServicesMock();

      // convertIp() expects to find its subnet spec in the index.
      services.index.add(subnet1);

      // DESIGN NOTE: cannot call services.convert.ip()  because our intent is
      // to test the real convertIp(), instead of its mock.
      const result = convertIp(services, privateIp1, 'nic1');
      const {nodes, symbols} = services.getLabyrinthGraphSpec();

      // Verify the return value.
      assert.equal(result.destination, 'privateIp1');
      assert.deepEqual(result.constraints, {destinationIp: privateIp1SourceIp});

      // Verify no symbol table additions.
      assert.equal(symbols.length, 0);

      // Verify that correct VNet node(s) were created in services.
      const expectedNodes: NodeSpec[] = [
        {
          key: 'privateIp1',
          name: privateIp1Id,
          endpoint: true,
          range: {sourceIp: privateIp1SourceIp},
          routes: [
            {
              destination: 'nic1',
              constraints: {
                destinationIp: `except ${privateIp1SourceIp}`,
              },
            },
          ],
        },
      ];

      assert.deepEqual(nodes, expectedNodes);
    });

    it('public ip', () => {
      const {services} = createGraphServicesMock();

      // convertIp() expects to find its subnet spec in the index.
      services.index.add(subnet1);

      // DESIGN NOTE: cannot call services.convert.ip()  because our intent is
      // to test the real convertIp(), instead of its mock.
      const result = convertIp(services, publicIp1, 'nic1');
      const {nodes, symbols} = services.getLabyrinthGraphSpec();

      // Verify the return value.
      assert.equal(result.destination, 'publicIp1');
      assert.deepEqual(result.constraints, {destinationIp: publicIp1SourceIp});

      // Verify no symbol table additions.
      assert.equal(symbols.length, 0);

      // Verify that correct VNet node(s) were created in services.
      const expectedNodes: NodeSpec[] = [
        {
          key: 'publicIp1',
          name: publicIp1Id,
          endpoint: true,
          range: {sourceIp: publicIp1SourceIp},
          routes: [
            {
              destination: 'nic1',
              constraints: {
                destinationIp: `except ${publicIp1SourceIp}`,
              },
            },
          ],
        },
      ];

      assert.deepEqual(nodes, expectedNodes);
    });
  });
}
