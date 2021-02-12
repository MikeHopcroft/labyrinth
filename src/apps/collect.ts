import commandLineUsage from 'command-line-usage';
import {Section} from 'command-line-usage';
import {promises as fs} from 'fs';
import minimist from 'minimist';
import path from 'path';
import tmp from 'tmp-promise';

import {queryResources} from '../collector';
import {convert} from '../converter';
import {fail, handleError, succeed} from '../utilities';

async function main() {
  const args = minimist(process.argv.slice(2));

  if (args.h || args.help) {
    showUsage();
    return succeed(false);
  }

  if (args._.length !== 3) {
    return fail(
      'Error: expected <subscriptionId>, <resourceGroup>, and <labyrinth.yaml>.'
    );
  }

  try {
    const subscriptionId = args._[0];
    const resourceGroup = args._[1];
    const outfile = args._[2];
    console.log(`Azure subscriptionId: ${subscriptionId}`);
    console.log(`Azure resourceGroup: ${resourceGroup}`);
    console.log(`Labyrinth graph output file: ${outfile}`);

    const resources = await queryResources(
      `resources | where resourceGroup == "${resourceGroup}"`,
      [subscriptionId]
    );

    // TODO: refactor from file-based usage to function calls
    const {path: tmpFile, cleanup} = await tmp.file();
    await fs.writeFile(tmpFile, JSON.stringify(resources));
    console.log(tmpFile);
    convert(tmpFile, outfile);
    await cleanup();

    console.log('Collection complete.');
  } catch (e) {
    handleError(e);
  }

  return succeed(true);
}

function showUsage() {
  const program = path.basename(process.argv[1]);

  const usage: Section[] = [
    {
      header: 'Azure resource graph collection tool',
      content:
        'Utility for generating Labyrinth graph from an Azure subscription.',
    },
    {
      header: 'Usage',
      content: [
        `node ${program} {underline <subscriptionId>} {underline <resourceGroup>} {underline <labyrinth.yaml>} [...options]`,
      ],
    },
    {
      header: 'Required Parameters',
      content: [
        {
          name: '{underline <subscriptionId>}',
          summary: 'Id for an Azure subscription.',
        },
        {
          name: '{underline <resourceGroup>}',
          summary: 'Name of an Azure resource group.',
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
