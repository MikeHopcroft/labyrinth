import { isLeft } from 'fp-ts/lib/Either';
import { ArrayType, Decoder, Errors, IntersectionType, UnionType } from 'io-ts';
import * as t from 'io-ts';

import { ValidationError } from './errors';

export function validate<A, I>(decoder: Decoder<I, A>, data: I): A {
  const x = decoder.decode(data);
  if (isLeft(x)) {
    const message = formatValidationErrorList(x.left).join('\n');
    console.log(message);

    throw new ValidationError(message);
  } else {
    return x.right;
  }
}

function formatValidationErrorList(errorList: Errors): string[] {
  const text: string[] = [];
  for (const error of errorList) {
    text.push(formatValidationError(error));
  }
  return text;
}

function formatValidationError(error: t.ValidationError): string {
  const path: string[] = [];
  const contexts = error.context;
  for (const [i, c] of contexts.entries()) {
    // console.log(`${i}: key=${c.key} type=${typeof c.type.name}`);
    if (i > 0) {
      if (contexts[i - 1].type instanceof ArrayType) {
        path.push(`[${c.key}]`);
      } else if (contexts[i - 1].type instanceof IntersectionType) {
        // Skip this step
      } else if (contexts[i - 1].type instanceof UnionType) {
        // Skip this step
      } else {
        if (i > 1) {
          path.push(`.${c.key}`);
        } else {
          path.push(`${c.key}`);
        }
      }
    }
  }

  const expected = contexts[contexts.length - 1].type.name;
  const location = path.join('');
  const observed = jsToString(error.value);
  return `Expecting ${expected} at ${location} but found ${observed}`;
}

const jsToString = (value: unknown) =>
  value === undefined ? 'undefined' : JSON.stringify(value);
