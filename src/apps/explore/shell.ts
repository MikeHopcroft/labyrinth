import readline from 'readline';

// Shell commands are implemented as CommandEntryPoints.
// The return value is the standard bash shell return code.
export type CommandEntryPoint<WORLD> = (args: string[], world: WORLD) => void;

export class Shell<WORLD> {
  private world: WORLD;
  private stepCommand: CommandEntryPoint<WORLD>;

  // Map of shell commands (e.g. from, to, back, etc.)
  private commands = new Map<string, CommandEntryPoint<WORLD>>();
  private completions: string[] = [];

  private rl: readline.Interface;
  private finishedPromise: Promise<void>;

  constructor(
    world: WORLD,
    commands: [string, CommandEntryPoint<WORLD>][],
    stepCommand: CommandEntryPoint<WORLD>
  ) {
    this.world = world;
    this.stepCommand = stepCommand;

    // Register shell commands.
    for (const c of commands) {
      this.registerCommand(...c);
    }

    // Start up the REPL.
    const rl = (this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: this.completer,
    }));

    // Register line input handler.
    rl.on('line', async (line: string) => {
      const trimmed = line.trim();
      // if (trimmed.length === 0 || trimmed === 'exit') {
      if (trimmed === 'exit') {
        rl.close();
      } else {
        this.processLine(trimmed);
        rl.prompt();
      }
    });

    rl.prompt();

    // Set up promise that resolves when rl closes.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.finishedPromise = new Promise<void>((resolve, reject) => {
      rl.on('close', () => {
        console.log();
        console.log('bye');
        resolve();
      });
    });
  }

  registerCommand(name: string, entryPoint: CommandEntryPoint<WORLD>) {
    if (this.commands.has(name)) {
      const message = `Attempting to register duplicate command "${name}"`;
      throw new TypeError(message);
    } else {
      this.commands.set(name, entryPoint);
      this.completions.push(name + ' ');
    }
  }

  // Returns a promise that resolves when the interactive shell exits.
  finished(): Promise<unknown> {
    return this.finishedPromise;
  }

  private processLine(line: string) {
    if (line.length > 0 && !line.startsWith('#')) {
      // TODO: better arg splitter that handles quotes.
      const args = line.trim().split(/\s+/);
      if (isNaN(Number(args[0]))) {
        const command = this.commands.get(args[0]);
        if (command === undefined) {
          console.log(`${args[0]}: command not found`);
        } else {
          try {
            command(args, this.world);
          } catch (e) {
            if (e instanceof TypeError) {
              console.log(e.message);
            } else {
              throw e;
            }
          }
        }
      } else {
        this.stepCommand(args, this.world);
      }
      console.log();
    }
  }

  private completer = (line: string) => {
    const hits = this.completions.filter(c => c.startsWith(line));
    return [hits, line];
  };
}
