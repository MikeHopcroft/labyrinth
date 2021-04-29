import commandLineUsage, {Section} from 'command-line-usage';
import minimist from 'minimist';

import {fail, handleError, succeed} from '../../utilities';

import {CommandEntryPoint, Shell} from './shell';
import {World} from './world';

/*
TODO:
  x WIP: commit
  usage message
  auto-complete node names
  follow to fork (1 vs 1!)
    need to suppress cycles
    need back!
  x break into separate files for shell, explorer, world
  universe file parameter
  save/restore history + .gitignore
  organize node list by friendly name
  inspect command
  look into using attribution
  tutorial page
  shell
    x template on world
    make third argument the unknown handler
      how to do error handling? shell.printusage()?
    x move commands outside
*/

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
      description: 'Go back to previous node on the path.',
    },
    {
      name: 'from <node>',
      description: 'Set initial node for forward traverse.',
    },
    {
      name: 'nodes',
      description: 'Display a list all of the nodes in the graph',
    },
    {
      name: 'to <node>',
      description: 'Set end node for backwards traverse',
    },
    {
      name: '<number>',
      description: 'Advance to the specified next step on the path.',
    },
    {
      name: '<number>!',
      description:
        'Advance to the specified next step on the path and continue advancing until a fork in the path.',
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
  console.log('Type "exit" to end the session.');
  console.log('Type "help" for information on commands.');
  console.log();

  console.log(`Analyzing ${graphFile}.`);

  try {
    const world = new World(graphFile);
    const commands: [string, CommandEntryPoint<World>][] = [
      ['b', backCommand],
      ['back', backCommand],
      ['from', fromCommand],
      ['help', helpCommand],
      ['inspect', inspectCommand],
      ['nodes', nodesCommand],
      ['to', toCommand],
    ];
    const shell = new Shell(world, commands, stepCommand);
    await shell.finished();
  } catch (e) {
    handleError(e);
  }
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

export function helpCommand(): void {
  console.log(commandLineUsage([commandsSection]));
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
