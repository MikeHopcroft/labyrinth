import commandLineUsage, {Section} from 'command-line-usage';
import minimist from 'minimist';

import {succeed} from '../utilities';

export default function main(invocation: string, parameters: string[]) {
  const args = minimist(parameters);

  if (args.h || args.help) {
    showUsage(invocation);
    return succeed(false);
  }
  console.log('THIS COMMAND HAS NOT BEEN IMPLEMENTED');
  return succeed(false);
}

function showUsage(invocation: string) {
  const usage: Section[] = [
    {
      header: 'Azure resource graph anonymizer',
      content: 'Removes sensitive data from Azure resource graphs.',
    },
    {
      header: 'NOTICE',
      content: 'THIS COMMAND HAS NOT BEEN IMPLEMENTED',
    },
    {
      header: 'Usage',
      content: [
        `${invocation} {underline <input.json>} {underline <output.json>} [...options]`,
      ],
    },
    {
      header: 'Required Parameters',
      content: [
        {
          name: '{underline <input.json>}',
          summary: 'Path to an Azure resource graph file.',
        },
        {
          name: '{underline <output.yaml>}',
          summary: 'Path to write the anonymized output file.',
        },
      ],
    },
    {
      header: 'Options',
      optionList: [
        {
          name: 'help',
          alias: 'h',
          description: 'Display help message.',
          type: Boolean,
        },
      ],
    },
  ];

  console.log(commandLineUsage(usage));
}
