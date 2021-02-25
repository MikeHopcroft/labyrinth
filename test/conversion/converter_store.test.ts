import {assert} from 'chai';
import 'mocha';
import {
  AzureIPConfiguration,
  ConverterStore,
  LocalIpConverter,
} from '../../src/conversion';

describe('ConverterStore', () => {
  it('Duplicate registration throws exception', () => {
    assert.throw(() => {
      ConverterStore.create<AzureIPConfiguration>(
        LocalIpConverter,
        LocalIpConverter
      );
    }, "Duplicate converter registered for type 'Microsoft.Network/networkInterfaces/ipConfigurations'");
  });
});
