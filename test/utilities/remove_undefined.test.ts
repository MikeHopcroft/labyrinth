import {assert} from 'chai';
import 'mocha';

import {removeUndefinedProperties} from '../../src/utilities';

describe('Utilties', () => {
  it('removeUndefinedProperties()', () => {
    const a = {x: 1, y: undefined, z: 'hello'};

    const aNotEmpty = removeUndefinedProperties(a);
    assert.equal(aNotEmpty, true);
    assert.deepEqual(a, {x: 1, z: 'hello'});

    const b = {x: undefined};
    const bNotEmpty = removeUndefinedProperties(b);
    assert.equal(bNotEmpty, false);
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    assert.deepEqual(b as any, {});
  });
});
