import {assert} from 'chai';
import 'mocha';
import {AzureResourceGraph} from '../../../src/conversion/azure/azure_types';
import {normalizeCase} from '../../../src/conversion/azure/normalize_case';

const inputGraph = [
  {
    id: 'UpperCaseId',
    name: 'UpperCaseName',
    properties: {
      virtualMachineProfile: {
        networkProfile: {
          networkInterfaceConfigurations: [
            {
              name: 'UpperCaseName-Nic',
              properties: {
                ipConfigurations: [
                  {
                    name: 'UpperCaseName-IpConfig',
                  },
                ],
              },
            },
          ],
        },
      },
    },
    resourceGroup: 'ResourceGroup',
    type: 'Microsoft.Compute/VirtualMachineScaleSets',
  },
];

export default function test() {
  describe('Normalization', () => {
    normalizeCase(inputGraph as AzureResourceGraph);
    const item = inputGraph[0];

    it('expect lower case "id"', () => {
      assert.equal(item.id, 'uppercaseid');
    });

    it('expect lower case "type"', () => {
      assert.equal(item.type, 'microsoft.compute/virtualmachinescalesets');
    });

    it('expect lower case "name"', () => {
      assert.equal(item.name, 'uppercasename');
    });

    it('expect lower case "name" on all types', () => {
      const nic =
        item.properties.virtualMachineProfile.networkProfile
          .networkInterfaceConfigurations[0];
      const ip = nic.properties.ipConfigurations[0];
      assert.equal(nic.name, 'uppercasename-nic');
      assert.equal(ip.name, 'uppercasename-ipconfig');
    });
  });
}
