import commandLineUsage, {Section} from 'command-line-usage';
import minimist from 'minimist';

import {FileSystem, YAML} from '../io';

import {AnyAzureObject} from '../conversion/azure';
import {convert} from '../conversion/azure/convert';

import {fail, handleError, succeed} from '../utilities';

export default function main(invocation: string, parameters: string[]) {
  const args = minimist(parameters);

  if (args.h || args.help) {
    showUsage(invocation);
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
    const {graph, unusedTypes} = convert(root);
    YAML.writeNodeGraphAsYamlFile(graph, outfile);
    console.log('Conversion complete.');
    printTypeUsageReport(unusedTypes);
  } catch (e) {
    handleError(e);
  }

  return succeed(true);
}

function printTypeUsageReport(unusedTypes: Map<string, Set<string>>) {
  if (unusedTypes.size > 0) {
    console.log('Unsupported or ignored Azure resource graph types:');
    const types = [...unusedTypes.keys()].sort();
    for (const [index, type] of types.entries()) {
      console.log(`  ${index}: ${type}`);
      const keys = unusedTypes.get(type);
      if (keys) {
        const items = [...keys].sort();
        for (const id of items) {
          console.log(`        ${id}`);
        }
      }
    }
  } else {
    console.log('All Azure resource graph types understood.');
  }
}

function showUsage(invocation: string) {
  const usage: Section[] = [
    {
      header: 'Azure resource graph conversion tool',
      content:
        'Utility for generating Labyrinth graph from an Azure resource graph.',
    },
    {
      header: 'Usage',
      content: [
        `${invocation} {underline <azure.json>} {underline <labyrinth.yaml>} [...options]`,
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
