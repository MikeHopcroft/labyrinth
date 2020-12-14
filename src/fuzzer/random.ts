import seedrandom from 'seedrandom';

export class Random {
    private readonly random: seedrandom.prng;

    constructor(seed: string) {
        this.random = seedrandom(seed); 
    }

    // Returns random integer in range [start, end).
    randomInRange(start:number, end:number): number {
        if (end < start) {
            const message = "end must be less than start";
            throw TypeError(message);
        }
        return start + Math.floor(this.random() * (end - start));
    }

    // Returns a random natural number less than max.
    randomNonNegative(max: number): number {
        if (max < 0) {
            const message = "max cannot be less than 0";
            throw TypeError(message);
        }
        return Math.floor(this.random() * max);
    }

    randomChoice<T>(items: T[]): T {
        if (items.length < 1) {
            const message = "Random.randomChoice: item array is empty";
            throw TypeError(message);
        }
        return items[this.randomNonNegative(items.length)];
    }

    randomChooseN<T>(items: T[], n: number): T[] {
        const pool = [...items];
        const choices: T[] = [];
        const limit = Math.min(n, items.length);
        for (let i = 0; i < limit; ++i) {
            const index = this.randomNonNegative(pool.length);
            choices.push(pool[index]);
            pool[index] = pool[items.length - 1];
            pool.pop();
        }
        return choices;
    }

    randomBoolean(p = 0.5): boolean {
        return this.random() < p;
    }
}
