import csv from 'csv-parse/lib/sync';
import path from 'path';
import {FileSystem, YAML} from '..';

import {Universe} from '../dimensions';
import {Conjunction, DimensionedRange} from '../setops';
import {PeekableSequence, validate} from '../utilities';

import {Rule} from './rule';

import {
  RuleSpec,
  codecRuleSpec,
  codecRuleSpecSet,
  codecRuleSpecNoIdSet,
  RuleSpecSet,
} from './ruleSpec';

interface LoaderOptions {
  extension?: string;
  source?: string;
}

export function loadRulesFile(
  universe: Universe,
  file: string,
  options: LoaderOptions = {}
): Rule[] {
  const e = options.extension || path.extname(file).toLowerCase();
  if (['.yaml', '.yml'].includes(e)) {
    return loadYamlRulesFile(universe, file, options);
  } else if (e === '.csv') {
    return loadCsvRulesFile(universe, file, options);
  } else if (e === '.txt') {
    return loadTxtRulesFile(universe, file, options);
  } else {
    const message = 'File extension must be csv, yml, or yaml.';
    throw new TypeError(message);
  }
}

///////////////////////////////////////////////////////////////////////////////
//
// Text format loader
//
///////////////////////////////////////////////////////////////////////////////

/** Loads a text-format rules file
 * @param {Universe} universe - provides definitions for the
 *  dimensions referenced by the rules file.
 * @param {string} filename - path to the rules file to be loaded
 *
 * The rules file consists of a sequence of rows, each of which is
 * a space-separated sequence of fields. The first row defines the
 * key of the fields filled by the remaining rows. The field keys
 * correspond to the Dimension.key values in the Universe. Note
 * that the field keys can appear in any order. There is no requirement
 * to include keys for all of the Dimensions, but a key cannot appear
 * in more than one field.
 *
 * Blank lines and lines starting with # and remark are considered
 * comments.
 *
 * @example foobar
 * # The first non-comment row defines the dimension keys
 * action, sourceIp, sourcePort, protocol
 * # The remaining lines define the field values
 * allow 127.0.0.0/8 80 tcp
 * deny any 53 any
 */
export function loadTxtRulesFile(
  universe: Universe,
  filename: string,
  options: LoaderOptions = {}
): Rule[] {
  const text = FileSystem.readUtfFileSync(filename);
  return loadTxtRulesString(universe, text, options);
}

export function loadTxtRulesString(
  universe: Universe,
  text: string,
  options: LoaderOptions = {}
): Rule[] {
  let priority = 0;
  const lines = new PeekableSequence(text.split(/\r?\n/).values());

  skipComments(lines);
  if (lines.atEOS()) {
    const message = 'Expected a header row.';
    throw new TypeError(message);
  }

  const headers = lines
    .get()
    .split(/\s+/)
    .map(x => x.trim());
  const dedupe = new Set<string>();
  for (const key of headers) {
    if (dedupe.has(key)) {
      const message = `Detected duplicate key "${key}".`;
      throw new TypeError(message);
    }
    dedupe.add(key);
  }

  const rules: Rule[] = [];
  while (!lines.atEOS()) {
    skipComments(lines);
    if (lines.atEOS()) {
      break;
    }

    const lineObject: {[key: string]: string | number} = {};
    const fields = lines
      .get()
      .split(/\s+/)
      .map(x => x.trim());
    for (const [column, value] of fields.entries()) {
      const key = headers[column];
      if (key === undefined) {
        const message = `Line ${lines.position()} has more columns than headers.`;
        throw new TypeError(message);
      }
      lineObject[key] = value;
    }

    if (lineObject.priority === undefined) {
      lineObject.priority = ++priority;
    }
    if (lineObject.action === 'permit') {
      lineObject.action = 'allow';
    }

    if (lineObject.id !== undefined) {
      const message = 'Illegal column: "id".';
      throw new TypeError(message);
    }
    lineObject.id = lines.position();
    lineObject.source = options.source || '';

    const spec = validate(codecRuleSpec, lineObject);
    const rule = parseRuleSpec(universe, spec);
    rules.push(rule);
  }

  return rules;
}

function skipComments(lines: PeekableSequence<string>) {
  while (!lines.atEOS()) {
    const line = lines.peek().trim();
    if (
      line.startsWith('#') ||
      line.startsWith('remark') ||
      line.length === 0
    ) {
      lines.get();
    } else {
      break;
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
//
// CSV format loader
//
///////////////////////////////////////////////////////////////////////////////

export function loadCsvRulesFile(
  universe: Universe,
  filename: string,
  options: LoaderOptions = {}
): Rule[] {
  const text = FileSystem.readUtfFileSync(filename);
  return loadCsvRulesString(universe, text, options);
}

export function loadCsvRulesString(
  universe: Universe,
  text: string,
  options: LoaderOptions = {}
): Rule[] {
  const rules = csv(text, {
    columns: true,
    relax_column_count_less: true,
    skipEmptyLines: true,
    trim: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }).map((rule: any, id: number) => {
    // TODO: REVIEW: why wouldn't CSV be used for DenyOverride?
    // (which uses priority)
    if (rule.priority !== undefined) {
      const message = 'Illegal column: "priority".';
      throw new TypeError(message);
    }
    if (rule.id !== undefined) {
      const message = 'Illegal column: "id".';
      throw new TypeError(message);
    }
    if (rule.source !== undefined) {
      const message = 'Illegal column: "source".';
      throw new TypeError(message);
    }
    return {...rule, id, priority: 1, source: options.source || ''};
  });

  const spec = validate(codecRuleSpecSet, {rules});
  return spec.rules.map(r => parseRuleSpec(universe, r));
}

///////////////////////////////////////////////////////////////////////////////
//
// YAML format loader
//
///////////////////////////////////////////////////////////////////////////////

export function loadYamlRulesFile(
  universe: Universe,
  filename: string,
  options: LoaderOptions = {}
): Rule[] {
  const text = FileSystem.readUtfFileSync(filename);
  return loadYamlRulesString(universe, text, options);
}

export function loadYamlRulesString(
  universe: Universe,
  text: string,
  options: LoaderOptions = {}
): Rule[] {
  const root = YAML.load(text);
  const spec = validate(codecRuleSpecNoIdSet, root) as RuleSpecSet;
  const rules = spec.rules.map((r, i) => {
    if (r.id !== undefined) {
      const message = 'Illegal field: "id".';
      throw new TypeError(message);
    }
    if (r.source !== undefined) {
      const message = 'Illegal column: "source".';
      throw new TypeError(message);
    }
    r.id = i;
    r.source = options.source || '';
    return parseRuleSpec(universe, r);
  });
  return rules;
}

// TODO: Consider moving to Rule.constructor().
export function parseRuleSpec(universe: Universe, spec: RuleSpec): Rule {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {action, id, priority, source, ...rest} = spec;
  const conjunction = parseConjunction(universe, rest, spec);

  return {action, priority, conjunction, spec};
}

export function parseConjunction<A>(
  universe: Universe,
  fields: {},
  spec: A
): Conjunction<A> {
  let conjunction = Conjunction.create([], new Set([spec]));

  for (const key of Object.getOwnPropertyNames(fields)) {
    const dimension = universe.get(key);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value = (fields as any)[key];
    if (typeof value === 'number') {
      value = value.toString();
    } else if (typeof value !== 'string') {
      const message = `${key}: expected a string value.`;
      throw new TypeError(message);
    }
    conjunction = conjunction.intersect(
      Conjunction.create(
        [new DimensionedRange(dimension, dimension.parse(value))],
        new Set<A>()
      )
    );
  }

  return conjunction;
}
