import {IComparer, IMap} from './specs';

export class MapX<TKey, TValue> implements IMap<TKey, TValue> {
  private readonly comparer: IComparer<TKey>;
  private readonly data: Map<TKey, TValue>;

  constructor(comparer: IComparer<TKey>) {
    this.comparer = comparer;
    this.data = new Map<TKey, TValue>();
  }

  set(key: TKey, value: TValue): IMap<TKey, TValue> {
    if (!this.has(key)) {
      this.data.set(this.comparer.key(key), value);
    }
    return this;
  }

  get(key: TKey): TValue | undefined {
    return this.data.get(this.comparer.key(key));
  }

  delete(key: TKey): boolean {
    return this.data.delete(this.comparer.key(key));
  }

  has(key: TKey): boolean {
    return this.data.has(this.comparer.key(key));
  }

  values(): IterableIterator<TValue> {
    return this.data.values();
  }
}
