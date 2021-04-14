// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleError(e: any): never {
  // console.log('************* Error ****************');
  // console.log(JSON.stringify(e, null, 4).slice(0,5000));

  let message: string;

  if (e.name === 'YAMLException') {
    message = `invalid YAML - ${e.reason}`;
  } else if (e.name === 'YAML Validation Error') {
    message = 'YAML does not conform to schema';
  } else {
    switch (e.code) {
      case 'ENOENT':
        message = `cannot ${e.syscall} "${e.path}".`;
        break;
      case 'EISDIR':
        message = 'directory found when file was expected.';
        break;
      default:
        message = e.message || 'unknown error';
    }
  }

  console.log(`Error: ${message}`);
  succeed(false);
}

export function fail(message: string): never {
  console.log(' ');
  console.log(message);
  console.log(' ');
  console.log('Use the -h flag for help.');
  console.log(' ');
  console.log('Aborting');
  console.log(' ');
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}

export function succeed(succeeded: boolean): never {
  if (succeeded) {
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  } else {
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
}
