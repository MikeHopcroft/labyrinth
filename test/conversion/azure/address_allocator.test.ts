import {assert} from 'chai';
import 'mocha';

import {AddressAllocator} from '../../../src/conversion/azure/address_allocator';
import {
  privateIp1Id,
  privateIp1SourceIp,
  privateIp2Id,
  privateIp2SourceIp,
  subnet1Id,
  subnet1SourceIps,
} from './sample_resource_graph';

export default function test() {
  describe('Address Allocator', () => {
    it('simple request', () => {
      const allocator = new AddressAllocator();
      allocator.registerSubnet(subnet1Id, subnet1SourceIps);

      const actualIp = allocator.allocate(subnet1Id, privateIp1Id);
      assert.equal(actualIp, '10.0.0.1');
    });

    it('simple request, two ids', () => {
      const allocator = new AddressAllocator();
      allocator.registerSubnet(subnet1Id, subnet1SourceIps);

      allocator.allocate(subnet1Id, privateIp1Id);
      const actualIp = allocator.allocate(subnet1Id, privateIp2Id);
      assert.equal(actualIp, '10.0.0.2');
    });

    it('id requested twice', () => {
      const allocator = new AddressAllocator();
      allocator.registerSubnet(subnet1Id, subnet1SourceIps);

      const originalIp = allocator.allocate(subnet1Id, privateIp1Id);
      const secondRequest = allocator.allocate(subnet1Id, privateIp1Id);
      assert.equal(secondRequest, originalIp);
    });

    it('throws error if same id requested for different subnets', () => {
      const allocator = new AddressAllocator();
      assert.throws(() => {
        allocator.allocate(subnet1Id, privateIp1Id);
      }, `Registration of subnet ${subnet1Id} has not happened`);
    });

    it('reserved ip is not allocated', () => {
      const allocator = new AddressAllocator();
      allocator.registerSubnet(subnet1Id, subnet1SourceIps);

      allocator.reserve(subnet1Id, privateIp1Id, privateIp1SourceIp);
      const allocatedIp = allocator.allocate(subnet1Id, privateIp2Id);
      assert.notEqual(allocatedIp, privateIp1SourceIp);
      assert.equal(allocatedIp, privateIp2SourceIp);
    });
  });
}
