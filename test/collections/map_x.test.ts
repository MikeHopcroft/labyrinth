import {assert} from 'chai';
import 'mocha';
import {Comparers, MapX} from '../../src/collections';

interface TestPayload {
  id: string;
  value: number;
}

function createMap() {
  return new MapX<string, TestPayload>(Comparers.CaseInsensitive);
}

describe('Collections - Case Insenstive Set', () => {
  it('Item shows as belonging when only case differrs in key', () => {
    const expected = {id: 'Test', value: 1};
    const key = 'test';

    const map = createMap();
    map.set(expected.id, expected);
    assert.isTrue(map.has(key));
  });

  it('Item can be retrieved when only case differrs in key', () => {
    const expected = {id: 'Test', value: 1};
    const key = 'test';

    const map = createMap();
    map.set(expected.id, expected);
    assert.deepEqual(map.get(key), expected);
  });

  it('Item can be deleted using key only differing by case', () => {
    const item = {id: 'Test', value: 1};
    const key = 'test';

    const map = createMap();
    map.set(item.id, item);
    assert.isTrue(map.has(item.id));
    assert.isTrue(map.delete(key));
    assert.isFalse(map.has(item.id));
  });

  it('If values added using different case, the first value only remains', () => {
    const item1 = {id: 'Test1', value: 1};
    const item2 = {id: 'test1', value: 2};

    const map = createMap();
    map.set(item1.id, item1);
    map.set(item2.id, item2);

    let count = 0;
    for (const x of map.values()) {
      assert.deepEqual(x, item1);
      count += 1;
    }

    assert.equal(count, 1);
  });
});
