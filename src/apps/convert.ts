import commandLineUsage from 'command-line-usage';
import {Section} from 'command-line-usage';
import minimist from 'minimist';
import path from 'path';
import {FileSystem, YAML} from '..';
import {AnyAzureObject} from '../conversion/azure';
import {AzureConverter} from '../conversion/azure/azure_converter';

import {fail, handleError, succeed} from '../utilities';

function main() {
  const args = minimist(process.argv.slice(2));

  if (args.h || args.help) {
    showUsage();
    return succeed(false);
  }

  if (args._.length !== 2) {
    return fail('Error: expected <azure.json> and <labyrinth.yaml> files.');
  }

  try {
    const infile = args._[0];
    const outfile = args._[1];
    console.log(`Azure resource graph input file: ${infile}`);
    console.log(`Labyrinth graph output file: ${outfile}`);
    const root = FileSystem.readFileSyncAs<AnyAzureObject[]>(infile);
    const converter = new AzureConverter();
    const graph = converter.Convert(root);
    YAML.writeNodeGraphAsYamlFile(graph, outfile);
    console.log('Conversion complete.');
  } catch (e) {
    handleError(e);
  }

  return succeed(true);
}

function showUsage() {
  const program = path.basename(process.argv[1]);

  const usage: Section[] = [
    {
      header: 'Azure resource graph conversion tool',
      content:
        'Utility for generating Labyrinth graph from an Azure resource graph.',
    },
    {
      header: 'Usage',
      content: [
        `node ${program} {underline <azure.json>} {underline <labyrinth.yaml>} [...options]`,
      ],
    },
    {
      header: 'Required Parameters',
      content: [
        {
          name: '{underline <azure.json>}',
          summary: 'Path to a JSON Azure resource graph.',
        },
        {
          name: '{underline <labyrinth.yaml>}',
          summary: 'Path to output file.',
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

main();
