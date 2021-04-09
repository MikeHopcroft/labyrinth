import {assert} from 'chai';
import 'mocha';

import {convertNSG} from '../../../src/conversion/azure/convert_nsg';

import {createGraphServicesMock, nsgWithRules1} from './sample_resource_graph';

export default function test() {
  describe('convertNsg()', () => {
    it('Rules should be sorted in priority order', () => {
      const {services} = createGraphServicesMock();

      // DESIGN NOTE: cannot call services.convert.nsg()  because our intent is
      // to test the real convertNsg(), instead of its mock.
      const result = convertNSG(services, nsgWithRules1, 'mockedVnet');
      const ruleOrder = result.inboundRules.map(x => x.priority);
      assert.deepEqual(ruleOrder, [100, 65000]);
    });
  });
}
