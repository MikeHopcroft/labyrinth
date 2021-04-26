import commandLineUsage, {Section} from 'command-line-usage';
import download from 'download';
import minimist from 'minimist';
import path from 'path';
import asyncPool from 'tiny-async-pool';

import {fail, handleError, succeed} from '../utilities';

export default async function main(invocation: string, parameters: string[]) {
  const args = minimist(parameters);

  if (args.h || args.help) {
    showUsage(invocation);
    return succeed(false);
  }

  if (args._.length > 1) {
    const extras = args._.slice(1)
      .map(x => `"${x}"`)
      .join(', ');
    return fail(`Error: undexpected parameters ${extras}.`);
  }

  let folder = 'samples';
  if (args._.length > 0) {
    folder = args._[0];
  }

  await downloadSamples(folder);

  return succeed(true);
}

function showUsage(invocation: string) {
  const usage: Section[] = [
    {
      header: 'Labyrinth Sample Downloader',
      content:
        'Downloads sample input files from https://github.com/MikeHopcroft/labyrinth.',
    },
    {
      header: 'Usage',
      content: [`node ${invocation} [{underline <folder>}]`],
    },
    {
      header: 'Parameter',
      content: [
        {
          name: '{underline <folder>}',
          summary:
            'Path to folder where samples will be written. ' +
            "Folder will be created if it doesn't exist. " +
            'Contents of folder will be overwritten. ' +
            'Defaults to "samples" if parameter is omitted.',
        },
      ],
    },
  ];

  console.log(commandLineUsage(usage));
}

async function downloadSamples(folder: string) {
  const examples = [
    '00.demo',
    '01.graph-basic-vnet',
    '02.graph-multi-subnet',
    '03.graph-internal-load-balancer',
    '04.graph-load-balancers',
    '05.graph-vmss',
    '06.graph-internet-routing',
    '07.graph-multiple-vnet',
    '08.graph-overlapping-vnet',
    '09.graph-load-balancer-outbound-rules',
  ];
  const files: {url: string; dest: string; file: string}[] = [];
  for (const name of examples) {
    files.push({
      url: `https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/${name}/resource-graph.json`,
      dest: path.join(folder, `data/azure/examples/${name}`),
      file: 'resource-graph',
    });
    files.push({
      url: `https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/${name}/convert.yaml`,
      dest: path.join(folder, `data/azure/examples/${name}`),
      file: 'convert.yaml',
    });
  }

  console.log('Downloading samples');

  try {
    await asyncPool(10, files, downloadOne);
  } catch (e) {
    handleError(e);
  }

  console.log(`Samples downloaded to ${folder}.`);
}

function downloadOne(entry: {url: string; dest: string; file: string}) {
  const {url, dest, file} = entry;
  console.log('  ' + path.join(dest, file));
  return download(url, dest);
}
