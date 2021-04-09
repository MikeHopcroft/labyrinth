import {assert} from 'chai';
import 'mocha';
import {asRootId, parseAzureId} from '../../../src/conversion/azure/azure_id';

export default function test() {
  describe('AzureId', () => {
    const validInput = {
      id:
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/vnet-test-01/providers/microsoft.compute/virtualmachinescalesets/vmss/virtualmachines/0/networkinterfaces/x-test-vpn-vnet-nic01/ipconfigurations/x-test-vpn-vnet-nic01-defaultipconfiguration',
      resourceGroup: 'test',
    };
    const azureId = parseAzureId(validInput);

    it('Extracts Subscription Id', () => {
      assert.equal(
        azureId.subscriptionId,
        '00000000-0000-0000-0000-000000000000'
      );
    });

    it('Extracts Resource Group', () => {
      assert.equal(azureId.resourceGroup, 'vnet-test-01');
    });

    it('Extracts Resource Name', () => {
      assert.equal(azureId.resourceName, 'vmss');
    });

    it('Level 1', () => {
      assert.deepEqual(azureId.subResource, {
        name: '0',
        type: 'virtualmachines',
      });
    });

    it('Level 2', () => {
      assert.deepEqual(azureId.subResource2, {
        name: 'x-test-vpn-vnet-nic01',
        type: 'networkinterfaces',
      });
    });

    it('Level 3', () => {
      assert.deepEqual(azureId.subResource3, {
        name: 'x-test-vpn-vnet-nic01-defaultipconfiguration',
        type: 'ipconfigurations',
      });
    });

    it('Root', () => {
      assert.equal(
        asRootId(azureId).id,
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/vnet-test-01/providers/microsoft.compute/virtualmachinescalesets/vmss'
      );
    });

    it('Throws on empty id', () => {
      assert.throws(() => {
        parseAzureId({id: '', resourceGroup: ''});
      });
    });

    it('Throws not at least valid root', () => {
      assert.throws(() => {
        parseAzureId({
          id:
            '/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/vnet-test-01/providers/microsoft.compute/virtualmachinescalesets',
          resourceGroup: '',
        });
      });
    });
  });
}
