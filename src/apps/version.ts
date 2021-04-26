import commandLineUsage, {Section} from 'command-line-usage';
import minimist from 'minimist';

const npmPackage = require('../../../package.json');

import {succeed} from '../utilities';

export default function main(invocation: string, parameters: string[]) {
  const args = minimist(parameters);

  if (args.h || args.help) {
    showUsage(invocation);
    return succeed(false);
  }
  console.log(`labyrinth version ${npmPackage.version}`);
  return succeed(true);
}

function showUsage(invocation: string) {
  const usage: Section[] = [
    {
      header: 'Labyrinth version',
      content: 'Displays NPM package version for labyrinth-nsg.',
    },
    {
      header: 'Usage',
      content: [`${invocation}`],
    },
  ];

  console.log(commandLineUsage(usage));
}
