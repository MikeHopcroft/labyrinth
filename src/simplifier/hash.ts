import {v3} from 'murmurhash';

// https://medium.com/coding-at-dawn/is-negative-zero-0-a-number-in-javascript-c62739f80114

// TODO: int32 vs uint32
export class Hasher {
  private readonly buffer0 = new ArrayBuffer(8);
  private readonly view0 = new DataView(this.buffer0);

  private readonly buffer1 = new ArrayBuffer(8);
  private readonly view1 = new DataView(this.buffer1);

  private readonly seed0: number;
  private readonly seed1: number;

  // Mask that zeros out the two high-order bits in a 32 bit unsigned.
  // Used to zero out the two high-order bits in a 64 bit IEEE 754 float.
  // The prevents us from representing -0, +/-infinity, and NaN, but allows
  // subnormals. Want to avoid NaN and -0 because they have special behavior
  // under equality (i.e. NaN !== NaN, and -0 === 0). Since the IEEE 754
  // floats are to be used as keys to data structures, it is important
  // that a key equals itself and never equals another key.
  // https://en.wikipedia.org/wiki/Double-precision_floating-point_format
  private static mask = 0x3fffffff;

  constructor(seed0: number, seed1: number) {
    this.seed0 = seed0;
    this.seed1 = seed1;

    // Verify little endianness
    this.view0.setFloat64(0, -0);
    if (this.view0.getUint8(0) !== 0x80) {
      const message = 'Hasher class expects little endian architecture.';
      throw new TypeError(message);
    }

    this.hash = this.hash.bind(this);
    this.xor = this.xor.bind(this);
  }

  // Uses murmurhash v3 to computes a 62-bit hash that is returned as an
  // IEEE 754 float.
  hash(text: string): number {
    this.view0.setUint32(0, v3(text, this.seed0) & Hasher.mask);
    this.view0.setUint32(4, v3(text, this.seed1));
    return this.view0.getFloat64(0);
  }

  // Given a pair of 62-bit hashes represented as IEEE 754 floats, return
  // the 64-bit float containing their bitwise exclusive-or.
  xor(a: number, b: number): number {
    this.view0.setFloat64(0, a);
    this.view1.setFloat64(0, b);

    const x = this.view0.getUint32(0) ^ this.view1.getUint32(0);
    this.view0.setUint32(0, x & Hasher.mask);
    this.view0.setUint32(4, this.view0.getUint32(4) ^ this.view1.getUint32(4));

    return this.view0.getFloat64(0);
  }
}
