import commandLineUsage, {Section} from 'command-line-usage';
import minimist from 'minimist';
import readline from 'readline';

import {Universe} from '../dimensions';
import {
  AnyRuleSpec,
  Graph,
  GraphBuilder,
  loadYamlGraphSpecFile,
  Path,
} from '../graph';
import {createSimplifier} from '../setops';
import {firewallSpec} from '../specs';
import {fail, handleError, succeed} from '../utilities';

/*
TODO:
  WIP: commit
  usage message
  auto-complete node names
  follow to fork (1 vs 1!)
  break into files
  universe file parameter
  save/restore history + .gitignore
  organize node list by friendly name
  inspect command
  look into using attribution
  tutorial page
*/

export default async function main(invocation: string, parameters: string[]) {
  const args = minimist(parameters);

  if (args.h || args.help) {
    showUsage(invocation);
    return succeed(false);
  }

  // if (args._.length === 0) {
  //   return fail('Error: expected a <network.yaml> file.');
  // }

  if (args._.length > 1) {
    const extras = args._.slice(1)
      .map(x => `"${x}"`)
      .join(', ');
    return fail(`Error: undexpected parameters ${extras}.`);
  }

  await explore(args._[0]);
  succeed(true);
}

function showUsage(invocation: string) {
  const usage: Section[] = [
    {
      header: 'Interactive network graph explorer',
      content: 'Interactive shell for analyzing reachability in networks.',
    },
    {
      header: 'Usage',
      content: [`${invocation} {underline <network.yaml>} [...options]`],
    },
    {
      header: 'Required Parameters',
      content: [
        {
          name: '{underline <network.yaml>}',
          summary:
            'Path to a yaml file the defines the network topology and ' +
            'its routing and filtering rules.',
        },
      ],
    },
    {
      header: 'Options',
      optionList: [
        // {
        //   name: 'from',
        //   alias: 'f',
        //   typeLabel: '{underline <node>}',
        //   description:
        //     'Find all paths in the graph that start at {underline <node>}.',
        // },
        // {
        //   name: 'to',
        //   alias: 't',
        //   typeLabel: '{underline <node>}',
        //   description:
        //     'Find all paths in the graph that can reach {underline <node>}.',
        // },
        // {
        //   name: 'universe',
        //   alias: 'u',
        //   typeLabel: '{underline <universe.yaml>}',
        //   description: `Use provided Universe specification.
        //                 Default Universe is for firewall rules with
        //                 - source ip
        //                 - source port
        //                 - destination ip
        //                 - destination port
        //                 - protocol\n`,
        //   type: Boolean,
        // },
        // {
        //   name: 'verbose',
        //   alias: 'v',
        //   description: 'Display routes for each path.',
        //   type: Boolean,
        // },
        // // TODO: advertise this feature once it has been fully implemented.
        // // {
        // //   name: 'cycles',
        // //   alias: 'c',
        // //   description: 'Find all cycles in the graph.',
        // //   type: Boolean,
        // // },
        // {
        //   name: 'paths',
        //   alias: 'p',
        //   description: 'Displays paths for each route.',
        //   type: Boolean,
        // },
        // {
        //   name: 'quiet',
        //   alias: 'q',
        //   description:
        //     "Quiet mode - don't summarize options and enumerate nodes.",
        //   type: Boolean,
        // },
        // {
        //   name: 'routers',
        //   alias: 'r',
        //   description: 'Display routers along paths.',
        //   type: Boolean,
        // },
        // {
        //   name: 'back-project',
        //   alias: 'b',
        //   description:
        //     'Backproject routes through NAT rewrites. Note that back-projecting is enabled by default when -t is used.',
        //   type: Boolean,
        // },
        // {
        //   name: 'expand',
        //   alias: 'e',
        //   description: 'Expand paths to show internal nodes.',
        //   type: Boolean,
        // },
      ],
    },
  ];

  console.log(commandLineUsage(usage));
}

async function explore(graphFile: string) {
  console.log('Welcome to the Labyrinth interactive graph explorer.');
  console.log('Type commands below.');
  console.log();
  console.log('Type "exit" to end the session.');
  console.log('Type "help" for information on commands.');
  console.log();

  console.log(`Analyzing ${graphFile}.`);

  try {
    const world = new World(graphFile);
    const shell = new Shell(world);
    await shell.finished();
  } catch (e) {
    handleError(e);
  }
}

class World {
  private graph: Graph;
  stack: Path[][] = [];
  forawardTraversal = true;
  startKey = '';
  indexes: number[] = [];

  constructor(graphFile: string) {
    // Initialize universe.
    const universeFile = undefined;
    const universe = universeFile
      ? Universe.fromYamlFile(universeFile)!
      : new Universe(firewallSpec);
    const simplifier = createSimplifier<AnyRuleSpec>(universe);

    // Load network graph.
    console.log(`Loading ${graphFile}`);
    const spec = loadYamlGraphSpecFile(graphFile);
    const builder = new GraphBuilder(universe, simplifier, spec);
    this.graph = builder.buildGraph();
  }

  back() {
    if (this.stack.length === 0) {
      console.log('No current path.');
      console.log('Use `from` or `to` command to specify start node.');
    } else if (this.stack.length === 1) {
      console.log(`Can't go back. At start node "${this.startKey}"`);
    } else {
      this.stack.shift();
      this.indexes.shift();
      this.summarize();
    }
  }

  from(key: string) {
    this.forawardTraversal = true;
    this.startKey = key;
    this.stack = [this.graph.start(key, this.forawardTraversal)];
    this.indexes = [];
    this.summarize();
  }

  nodes() {
    for (const node of this.graph.nodes) {
      console.log(node.key);
    }
  }

  step(index: number) {
    if (this.stack.length === 0) {
      console.log('No current path to step along.');
      console.log('Use `from` or `to` command to specify start node.');
    } else {
      const path = this.stack[0][index];
      if (path === undefined) {
        console.log(`Bad step ${index}.`);
        console.log(`Legal values: ${[...this.stack[0].keys()].join(', ')}.`);
      } else {
        this.stack.unshift(this.graph.step(path, this.forawardTraversal));
        this.indexes.unshift(index);
        this.summarize();
      }
    }
  }

  to(key: string) {
    this.forawardTraversal = false;
    this.startKey = key;
    this.stack = [this.graph.start(key, this.forawardTraversal)];
    this.indexes = [];
    this.summarize();
  }

  summarize() {
    const outbound = this.forawardTraversal;
    if (this.stack.length === 0) {
      console.log('No start node specified.');
      console.log('Use `from` or `to` command to specify start node.');
    } else {
      if (this.indexes[0] !== undefined) {
        const path = this.stack[1][this.indexes[0]];
        console.log(
          this.graph.formatPath(path, outbound, {
            outbound,
          })
        );
        console.log('\t');
        console.log(path.routes.format({}));
      } else {
        console.log('\t');
        console.log(this.startKey);
        console.log('(universe)');
      }

      console.log('\t');
      if (this.stack[0].length > 0) {
        console.log('Next steps:');
        for (const [index, path] of this.stack[0].entries()) {
          console.log(
            `  ${index}: ${path.edge.edge.from} => ${path.edge.edge.to}`
          );
        }
      } else {
        console.log('Path terminates here.');
      }
    }
  }
}

// Shell commands are implemented as CommandEntryPoints.
// The return value is the standard bash shell return code.
type CommandEntryPoint = (args: string[], world: World) => void;

// const maxHistorySteps = 1000;
// const historyFile = '.repl_history';

class Shell {
  private world: World;

  // Map of shell commands (e.g. from, to, back, etc.)
  private commands = new Map<string, CommandEntryPoint>();
  private completions: string[] = [];

  private rl: readline.Interface;
  private finishedPromise: Promise<void>;

  constructor(world: World) {
    this.world = world;

    // Register shell commands.
    this.registerCommand('b', backCommand);
    this.registerCommand('back', backCommand);
    this.registerCommand('from', fromCommand);
    this.registerCommand('help', helpCommand);
    this.registerCommand('inspect', inspectCommand);
    this.registerCommand('nodes', nodesCommand);
    this.registerCommand('to', toCommand);

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

  registerCommand(name: string, entryPoint: CommandEntryPoint) {
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
        stepCommand(args, this.world);
      }
      console.log();
    }
  }

  private completer = (line: string) => {
    const hits = this.completions.filter(c => c.startsWith(line));
    return [hits, line];
  };
}

export function backCommand(args: string[], world: World): void {
  if (args.length !== 1) {
    console.log('Unexpected parameter.');
  } else {
    world.back();
  }
}

export function fromCommand(args: string[], world: World): void {
  if (args.length < 2) {
    console.log('No start node specified.');
  } else if (args.length > 2) {
    console.log('Unexpected parameter after start node.');
  } else {
    world.from(args[1]);
  }
}

export function helpCommand(args: string[]): void {
  console.log(`help(${args[1]})`);
}

export function inspectCommand(args: string[]): void {
  console.log(`inspect(${args[1]})`);
}

export function stepCommand(args: string[], world: World): void {
  if (args.length > 1) {
    console.log('Unexpected parameter.');
  } else {
    const index = Number(args[0]);
    if (isNaN(index)) {
      console.log('Expected a path number.');
    } else {
      world.step(index);
    }
  }
}

export function nodesCommand(args: string[], world: World): void {
  if (args.length !== 1) {
    console.log('Unexpected parameter.');
  } else {
    world.nodes();
  }
}

export function toCommand(args: string[], world: World): void {
  if (args.length < 2) {
    console.log('No start node specified.');
  } else if (args.length > 2) {
    console.log('Unexpected parameter after start node.');
  } else {
    world.to(args[1]);
  }
}

/*
Commands

start <node>
from <node> (need to save traversal direction state somewhere)
to <node>
back
forward?
1, 2, 3, ...
examine
undo

Graph API

  Given a node (or path) and a disjunction
    Generate list of paths with disjunctions
*/
