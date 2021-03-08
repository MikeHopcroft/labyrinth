class Trie<T> {
  private pathCount = 0;
  private isEndpoint = false;
  private readonly children = new Map<T, Trie<T>>();

  // Attempts to add `key` to the trie. Returns true if `key` was added
  // successfully. Returns false if `key` is a duplicate of an existing
  // entry.
  add(key: T[], index: number | undefined = undefined): boolean {
    index = index ?? key.length - 1;
    if (index < 0) {
      if (this.isEndpoint) {
        return false;
      } else {
        this.isEndpoint = true;
        return true;
      }
    } else {
      // if (this.isEndpoint) {
      //   // Key is already in the trie. Don't add it again.
      //   return false;
      // }

      const child = this.children.get(key[index]);
      if (child) {
        // Index contains at least one other key with this suffix.
        // Attempt to add the suffix.
        if (child.add(key, index - 1)) {
          // Suffix was unique, so update the pathCount through this node as
          // we backtrack.
          this.pathCount++;
          return true;
        } else {
          // Suffix was not unique. Don't add it.
          return false;
        }
      } else {
        // Index does not contain this suffix. Add it.
        const newChild = new Trie<T>();
        newChild.add(key, index - 1);
        this.children.set(key[index], newChild);
        this.pathCount++;
        return true;
      }
    }
  }

  // Returns the shortest unique suffix of `key`.
  shorten(key: T[], index: number | undefined = undefined): T[] {
    index = index ?? key.length - 1;
    if (this.pathCount === 1) {
      // Suffix is unique, so stop here and return suffix.
      return [];
    } else if (index < 0) {
      // Since keys are unique, pathCount must equal 1 here,
      // so stop here and return suffix.
      return [];
    } else {
      const child = this.children.get(key[index]);
      if (child) {
        // This suffix is in the trie.
        const suffix = child.shorten(key, index - 1);
        suffix.push(key[index]);
        return suffix;
      } else {
        const message = 'Unknown key.';
        throw new TypeError(message);
      }
    }
  }
}

export class NameShortener {
  private reversing = false;
  private readonly trie = new Trie<string>();

  constructor(names: IterableIterator<string> | undefined = undefined) {
    if (names) {
      for (const name of names) {
        this.add(name);
      }
    }
  }

  reserveMode(reversing: boolean) {
    this.reversing = reversing;
  }

  add(name: string) {
    const key = name.split(/\//);
    this.trie.add(key);
  }

  shorten(name: string): string {
    const key = name.split(/\//);
    if (this.reversing) {
      return this.trie.shorten(key).reverse().join('/');
    } else {
      return this.trie.shorten(key).join('/');
    }
  }
}
