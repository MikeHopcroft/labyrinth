#!/usr/bin/env node

import commandLineUsage, {Section} from 'command-line-usage';
import path from 'path';

import {succeed} from '../utilities';

import analyze from './analyze';
import anonymize from './anonymize';
import convert from './convert';
import explore from './explore';
import graph from './graph';
import samples from './samples';
import version from './version';

const commands: [
  string[],
  (command: string, args: string[]) => Promise<void>
][] = [
  [['anonymize'], anonymize],
  [['convert'], convert],
  [['explore'], explore],
  [['firewall'], analyze],
  [['graph'], graph],
  [['samples'], samples],
  [['version'], version],
];

async function main() {
  if (process.argv.length < 3) {
    showUsage();
    return succeed(false);
  }

  const command = process.argv[2];
  const succeeded = await dispatch(command);
  if (!succeeded) {
    showUsage();
    return succeed(false);
  }

  return succeed(true);
}

async function dispatch(command: string) {
  let args = process.argv.slice(3);
  if (command === 'help') {
    if (process.argv.length === 4) {
      args = [process.argv[3], '--help'];
      command = process.argv[3];
    } else {
      showUsage();
      return succeed(true);
    }
  }
  const invocation = path.basename(process.argv[1], '.js') + ' ' + command;

  for (const c of commands) {
    for (const alias of c[0]) {
      if (alias === command) {
        await c[1](invocation, args);
        return true;
      }
    }
  }
  console.log(`Unknown sub-command "${command}".`);

  return false;
}

function showUsage() {
  const program = path.basename(process.argv[1], '.js');

  const usage: Section[] = [
    {
      header: 'Labyrinth Network Analysis Tool',
      // content:
      //   'Downloads sample input files from https://github.com/MikeHopcroft/labyrinth.',
    },
    {
      header: 'Usage',
      content: [`${program} {underline <command>}`],
    },
    {
      header: 'Commands',
      content: [
        {
          name: 'anonymize',
          summary: 'Anonymize an Azure resource graph file',
        },
        {
          name: 'convert',
          summary: 'Convert an Azure resource graph for Labyrinth analysis',
        },
        {
          name: 'firewall',
          summary: 'Analyze firewall rules',
        },
        {
          name: 'graph',
          summary: 'Perform graph flow analysis',
        },
        {
          name: 'help',
          summary: 'Display help message',
        },
        {
          name: 'samples',
          summary: 'Download sample graphs',
        },
        {
          name: 'version',
          summary: 'Display the Labyrinth version',
        },
      ],
    },
    {
      content:
        "See 'labyrinth help <command>' for help on a specific subcommand.",
    },
  ];

  console.log(commandLineUsage(usage));
}

main();
