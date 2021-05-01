import compareVersions from 'compare-versions';
import fs from 'fs';
import {ReadLineOptions} from 'node:readline';
import readline from 'readline';

// Shell commands are implemented as CommandEntryPoints.
// The return value is the standard bash shell return code.
export type CommandEntryPoint<WORLD> = (args: string[], world: WORLD) => void;
export type LineProcessor<WORLD> = (line: string, world: WORLD) => boolean;

const maxHistorySteps = 1000;
const historyFile = '.explorer_history';

export class Shell<WORLD> {
  private world: WORLD;
  private fallbackProcessor: LineProcessor<WORLD>;
  private parameterCompleter: readline.Completer;

  // Map of shell commands (e.g. from, to, back, etc.)
  private commands = new Map<string, CommandEntryPoint<WORLD>>();
  private completions: string[] = [];

  history: string[] = [];

  private rl: readline.Interface;
  private finishedPromise: Promise<void>;

  constructor(
    world: WORLD,
    commands: [string, CommandEntryPoint<WORLD>][],
    fallbackProcessor: LineProcessor<WORLD>,
    parameterCompleter: readline.Completer
  ) {
    this.world = world;
    this.fallbackProcessor = fallbackProcessor;
    this.parameterCompleter = parameterCompleter;
    this.completer = this.completer.bind(this);

    // Register shell commands.
    for (const c of commands) {
      this.registerCommand(...c);
    }

    //
    // Start up the REPL.
    //

    // Load REPL history from file.
    if (fs.existsSync(historyFile)) {
      const text = fs.readFileSync(historyFile).toString();
      this.history = text.split(/\r?\n/g);
    }
    const options: ReadLineOptions = {
      input: process.stdin,
      output: process.stdout,
      completer: this.completer,
      historySize: maxHistorySteps,
    };
    // NOTE: these options should only work for node versions 16.0.0 and higher.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const node_16_0_1_Options: any = {
      ...options,
      history: this.history,
    };
    const rl = (this.rl = readline.createInterface(node_16_0_1_Options));

    // NOTE: this event should only work for node versions 16.0.0 and higher.
    rl.on('history', (history: string[]) => {
      this.history = history;
    });

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
        fs.writeFileSync(historyFile, this.history.join('\n'));
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

  static versionWarning(): string | undefined {
    const minVersion = '16.0.0';
    if (compareVersions(process.version, minVersion) < 0) {
      return (
        `WARNING: Detected node version ${process.version}. ` +
        `Some interactive functionality, such as command history, requires node version ${minVersion}, or higher.`
      );
    }
    return undefined;
  }

  private processLine(line: string) {
    if (line.length > 0 && !line.startsWith('#')) {
      // TODO: better arg splitter that handles quotes.
      const args = line.trim().split(/\s+/);
      const command = this.commands.get(args[0]);
      if (command === undefined) {
        if (!this.fallbackProcessor(line, this.world)) {
          console.log(`${args[0]}: command not found`);
        }
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

      console.log();
    }
  }

  private completer(line: string): readline.CompleterResult {
    // NOTE: don't trim() trailing spaces to we can detect trailing space that
    // indicates start of second term complation.
    const parts = line.trimStart().split(/\s+/);
    if (parts.length === 2) {
      return this.parameterCompleter(line);
    } else {
      const hits = this.completions.filter(c => c.startsWith(line));
      return [hits, line];
    }
  }
}
