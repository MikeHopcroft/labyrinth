export interface ISet<T> {
  add(id: T): ISet<T>;
  has(id: T): boolean;
  delete(id: T): boolean;
  values(): IterableIterator<T>;
}

export interface IMap<TKey, TValue> {
  set(key: TKey, value: TValue): IMap<TKey, TValue>;
  get(key: TKey): TValue | undefined;
  has(key: TKey): boolean;
  delete(key: TKey): boolean;
  values(): IterableIterator<TValue>;
}

export interface IComparer<T> {
  equals(inputX: T, inputY: T): boolean;
  key(input: T): T;
}
