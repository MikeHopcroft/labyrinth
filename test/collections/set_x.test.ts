import {assert} from 'chai';
import 'mocha';
import {Comparers, SetX} from '../../src/collections';

function createSet() {
  return new SetX<string>(Comparers.CaseInsensitive);
}

describe('Collections - Case Insenstive Set', () => {
  it('Item shows as belonging when only case differrs', () => {
    const item1 = 'Test';
    const item2 = 'test';

    const set = createSet();
    set.add(item1);
    assert.isTrue(set.has(item2));
  });

  it('Item can be deleted using key only differing by case', () => {
    const item1 = 'Test1';
    const item2 = 'test1';

    const set = createSet();
    set.add(item1);
    assert.isTrue(set.has(item1));
    assert.isTrue(set.delete(item2));
    assert.isFalse(set.has(item1));
  });

  it('If values added using different case, the first value only remains', () => {
    const item1 = 'Test1';
    const item2 = 'test1';

    const set = createSet();
    set.add(item1);
    set.add(item2);

    let count = 0;
    for (const x of set.values()) {
      assert.equal(x, item1);
      count += 1;
    }

    assert.equal(count, 1);
  });
});
