import commandLineUsage, {Section} from 'command-line-usage';
import minimist from 'minimist';
import readline from 'readline';

import {fail, handleError, succeed} from '../../utilities';

import {CommandEntryPoint, Shell} from './shell';
import {World} from './world';

/*
TODO:
  BUG: readline history doesn't seem to save duplicates
    Seems to be by design
    https://github.com/nodejs/node/blob/54dfdbcccf1f2844974bdcdedbfa1f45d75c55d5/lib/readline.js
  x Update labyrinth help message - add explore
  x BUG: Cannot read property 'edge' of undefined
  x rename 'summarize' to 'path'
  x rename 'inspect' to 'spec'
  tags/symbols command
    should not hard-code dimension names
    formatting should do symbol lookup
    formatting should consider complement
  x edges command
  x history command
  tutorial page
  package.json required node version
    https://stackoverflow.com/questions/29349684/how-can-i-specify-the-required-node-js-version-in-package-json
  look into using attribution
  x Graph.nodes() shouldn't sort on every call
    x It doesn't sort. Where does sort happen?
  x organize node list by friendly name
  universe file parameter
  x inspect command
  x auto-complete node names
  x save/restore history + .gitignore
    x upgrade to node 16.0.0
    x version check
    x update docs to mention new version
  x WIP: commit
  x usage message
  x follow to fork (1 vs 1!)
    x need to suppress cycles
    x need back!
  x break into separate files for shell, explorer, world
  x shell
    x template on world
    x make third argument the unknown handler
      x how to do error handling? shell.printusage()?
    x move commands outside
*/
const defaultHistoryCommandSteps = 20;

export default async function main(invocation: string, parameters: string[]) {
  const args = minimist(parameters);

  if (args.h || args.help) {
    showUsage(invocation);
    return succeed(false);
  }

  if (args._.length === 0) {
    return fail('Error: expected a <network.yaml> file.');
  }

  if (args._.length > 1) {
    const extras = args._.slice(1)
      .map(x => `"${x}"`)
      .join(', ');
    return fail(`Error: undexpected parameters ${extras}.`);
  }

  await explore(args._[0]);
  succeed(true);
}

const commandsSection = {
  header: 'Commands',
  content: [
    {
      name: 'back',
      description: 'Go back to previous node on the path. ',
    },
    {
      name: 'back!',
      description:
        'Go back to previous node on the path and continue retreating until encountering a fork in the path.',
    },
    {
      name: 'edges',
      description: 'Display edges from current node.',
    },
    {
      name: 'from <node>',
      description: 'Set initial node for a forward traversal.',
    },
    {
      name: 'history [<n>]',
      description: `Display last <n> steps of command history. <n> defaults to ${defaultHistoryCommandSteps}.`,
    },
    {
      name: 'nodes',
      description: 'Display a list all of the nodes in the graph.',
    },
    {
      name: 'path',
      description: 'Display current traversal path and headers.',
    },
    {
      name: 'spec [<node>]',
      description:
        'Print out the specification for a node. Defaults to current node.',
    },
    {
      name: 'symbols [<name>]',
      description: 'Display symbol table entry.',
    },
    {
      name: 'to <node>',
      description: 'Set end node for backwards traversal.',
    },
    {
      name: '<number>',
      description: 'Advance to the specified next step on the path.',
    },
    {
      name: '<number>!',
      description:
        'Advance to the specified next step on the path and continue advancing until encountering a fork in the path.',
    },
  ],
};

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
        {
          name: 'universe',
          alias: 'u',
          typeLabel: '{underline <universe.yaml>}',
          description: `Use provided Universe specification.
                        Default Universe is for firewall rules with
                        - source ip
                        - source port
                        - destination ip
                        - destination port
                        - protocol\n`,
          type: Boolean,
        },
      ],
    },
    commandsSection,
  ];

  console.log(commandLineUsage(usage));
}

async function explore(graphFile: string) {
  console.log('Welcome to the Labyrinth interactive graph explorer.');
  console.log('Type commands below.');
  console.log();
  console.log('Type "exit" or "<CTRL>-D" to end the session.');
  console.log('Type "help" for information on commands.');
  console.log();

  const warning = Shell.versionWarning();
  if (warning) {
    console.log(warning);
    console.log('\t');
  }

  console.log(`Analyzing ${graphFile}.`);
  console.log('\t');

  try {
    const world = new World(graphFile);
    const commands: [string, CommandEntryPoint<World>][] = [
      ['back', backCommand],
      ['back!', backToForkCommand],
      ['edges', edgesCommand],
      ['from', fromCommand],
      ['help', helpCommand],
      ['nodes', nodesCommand],
      ['path', pathCommand],
      ['spec', specCommand],
      ['symbols', symbolsCommand],
      ['to', toCommand],
    ];
    const shell = new Shell(
      world,
      commands,
      fallbackProcessor,
      parameterCompleter(world)
    );
    shell.registerCommand('history', historyCommand(shell));

    await shell.finished();
  } catch (e) {
    handleError(e);
  }
}

export function fallbackProcessor(line: string, world: World): boolean {
  const args = line.trim().split(/\s+/);
  if (args.length === 1) {
    const match = args[0].match(/\s*(\d+)(!?)\s*$/);
    if (match) {
      const index = Number(match[1]);
      world.step(index, match[2] === '!');
      return true;
    }
  }

  return false;
}

export function backCommand(args: string[], world: World): void {
  if (args.length !== 1) {
    console.log('Unexpected parameter.');
  } else {
    world.back(false);
  }
}

export function backToForkCommand(args: string[], world: World): void {
  if (args.length !== 1) {
    console.log('Unexpected parameter.');
  } else {
    world.back(true);
  }
}

export function edgesCommand(args: string[], world: World): void {
  if (args.length > 2) {
    console.log('Unexpected parameter.');
  } else {
    world.edges(args[1]);
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

export function helpCommand(): void {
  console.log(commandLineUsage([commandsSection]));
}

export function historyCommand(shell: Shell<World>) {
  return (args: string[]): void => {
    if (args.length > 2) {
      console.log('Unexpected parameter.');
    } else {
      let steps = defaultHistoryCommandSteps;
      if (args[1] !== undefined) {
        steps = Number(args[1]);
      }
      if (isNaN(steps)) {
        console.log('Expect numeric history step count.');
      }
      if (steps < 0) {
        console.log('Expect positive history step count.');
      } else {
        if (steps > shell.history.length) {
          steps = shell.history.length;
        }
        for (let i = steps - 1; i >= 0; --i) {
          console.log(`${shell.history.length - i}: ${shell.history[i]}`);
        }
      }
    }
  };
}

export function specCommand(args: string[], world: World): void {
  if (args.length > 2) {
    console.log('Unexpected parameter.');
  } else {
    world.spec(args[1]);
  }
}

export function nodesCommand(args: string[], world: World): void {
  if (args.length !== 1) {
    console.log('Unexpected parameter.');
  } else {
    world.printNodes();
  }
}

export function pathCommand(args: string[], world: World): void {
  if (args.length > 1) {
    console.log('Unexpected parameter.');
  } else {
    world.showPath();
  }
}

export function symbolsCommand(args: string[], world: World): void {
  if (args.length === 2) {
    console.log('Lookup of individual symbols not yet implemented.');
  } else if (args.length > 2) {
    console.log('Unexpected parameter.');
  } else {
    world.symbols(args[1]);
  }
}

export function toCommand(args: string[], world: World): void {
  if (args.length < 2) {
    console.log('No end node specified.');
  } else if (args.length > 2) {
    console.log('Unexpected parameter after start node.');
  } else {
    world.to(args[1]);
  }
}

function parameterCompleter(world: World): readline.Completer {
  return (line: string): readline.CompleterResult => {
    const hits: string[] = [];

    // NOTE: don't trim() trailing spaces to we can detect trailing space that
    // indicates start of second term complation.
    const parts = line.trimStart().split(/\s+/);
    if (
      parts.length === 2 &&
      (parts[0] === 'edges' ||
        parts[0] === 'from' ||
        parts[0] === 'to' ||
        parts[0] === 'inspect')
    ) {
      const command = parts[0];
      const node = parts[1].trim();
      const keys = world.keys();
      for (const key of keys) {
        if (key.startsWith(node)) {
          hits.push(command + ' ' + key);
        }
      }
    }
    return [hits, line];
  };
}
