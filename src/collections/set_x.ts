import {IComparer, ISet} from './specs';

export class SetX<T> implements ISet<T> {
  private readonly comparer: IComparer<T>;
  private readonly data: Map<T, T>;

  constructor(comparer: IComparer<T>) {
    this.comparer = comparer;
    this.data = new Map<T, T>();
  }

  add(id: T): ISet<T> {
    const key = this.comparer.key(id);
    if (!this.data.has(key)) {
      this.data.set(key, id);
    }

    return this;
  }

  delete(id: T): boolean {
    return this.data.delete(this.comparer.key(id));
  }

  has(id: T): boolean {
    return this.data.has(this.comparer.key(id));
  }

  values(): IterableIterator<T> {
    return this.data.values();
  }
}
