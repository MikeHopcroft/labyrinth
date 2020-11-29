export class PeekableSequence<T> {
  private readonly iterator: IterableIterator<T>;
  private current: IteratorResult<T>;
  private count = 0;

  constructor(iterator: IterableIterator<T>) {
    this.iterator = iterator;
    this.current = this.iterator.next();
  }

  peek(): T {
    if (!this.current.done) {
      return this.current.value;
    } else {
      throw TypeError('PeekableSequence<T>.peek(): at end of stream.');
    }
  }

  get(): T {
    if (!this.current.done) {
      const value = this.current.value;
      this.current = this.iterator.next();
      ++this.count;
      return value;
    } else {
      throw TypeError('PeekableSequence<T>.get(): at end of stream.');
    }
  }

  // Returns true if we're at the end of the stream (EOS)
  atEOS(): boolean {
    return this.current.done || false;
  }

  skip(value: T): boolean {
    if (!this.atEOS() && this.peek() === value) {
      this.get();
      return true;
    }
    return false;
  }

  nextIs(value: T): boolean {
    if (!this.atEOS()) {
      return this.peek() === value;
    }

    return false;
  }

  position(): number {
    return this.count;
  }
}
