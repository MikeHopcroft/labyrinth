import {assert} from 'chai';
import 'mocha';

import {NodeSpec} from '../../../src';

import {convertPrivateIp} from '../../../src/conversion/azure';

import {
  createGraphServicesMock,
  nic1OutboundKey,
  privateIp1,
  privateIp1Id,
  privateIp1Key,
  privateIp1SourceIp,
  subnet1,
} from './sample_resource_graph';

export default function test() {
  it('convertPrivateIp()', () => {
    const {services} = createGraphServicesMock();

    // convertIp() expects to find its subnet spec in the index.
    services.index.add(subnet1);

    // DESIGN NOTE: cannot call services.convert.ip()  because our intent is
    // to test the real convertIp(), instead of its mock.
    const result = convertPrivateIp(services, privateIp1, nic1OutboundKey);
    const {nodes, symbols} = services.getLabyrinthGraphSpec();

    // Verify the return value.
    assert.equal(result.destination, privateIp1Key);
    assert.deepEqual(result.constraints, {destinationIp: privateIp1SourceIp});

    // Verify no symbol table additions.
    assert.equal(symbols.length, 0);

    // Verify that correct VNet node(s) were created in services.
    const expectedNodes: NodeSpec[] = [
      {
        key: privateIp1Key,
        name: privateIp1Id,
        friendlyName: privateIp1.name,
        endpoint: true,
        routes: [
          {
            destination: nic1OutboundKey,
            constraints: {
              destinationIp: `except ${privateIp1SourceIp}`,
            },
          },
        ],
      },
    ];

    assert.deepEqual(nodes, expectedNodes);
  });
}
