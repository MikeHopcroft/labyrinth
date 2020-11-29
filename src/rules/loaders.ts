// import * as csv from 'fast-csv';
import csv from 'csv-parse/lib/sync'
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';


import { Universe } from '../dimensions';
import { Conjunction } from '../setops';
import { PeekableSequence, validate } from '../utilities';

import { Rule, RuleSpec, ruleSpecType, ruleSpecSetType } from './types';

export function loadRulesFile(
  universe: Universe,
  file: string
): Rule[] {
  const e = path.extname(file).toLowerCase();
  console.log(`EXT = "${e}"`);
  if (['.yaml', '.yml'].includes(e)) {
    return loadYamlRulesFile(universe, file);
  } else if (e === '.csv') {
    return loadCsvRulesFile(universe, file);
  } else if (e === '.txt') {
    return loadTxtRulesFile(universe, file);
  } else {
    const message = 'File extension must be csv, yml, or yaml.';
    throw new TypeError(message);
  }
}

export function loadTxtRulesFile(
  universe: Universe,
  filename: string
): Rule[] {
  const text = fs.readFileSync(filename, 'utf-8');
  return loadTxtRulesString(universe, text);
}

export function loadTxtRulesString(universe: Universe, text: string): Rule[] {
  const lines = new PeekableSequence(text.split(/\r?\n/).values());

  skipComments(lines);
  if (lines.atEOS()) {
    const message = 'Expected a header row.';
    throw new TypeError(message);
  }

  const headers = lines.get().split(/\s+/).map(x => x.trim());

  const rules: Rule[] = [];
  while (!lines.atEOS()) {
    skipComments(lines);
    if (lines.atEOS()) {
      break;
    }

    const lineObject: {[key:string]: string|number} = {};
    const fields = lines.get().split(/\s+/).map(x => x.trim());
    for (const [column, value] of fields.entries()) {
      const key = headers[column];
      if (key === undefined) {
        const message = `Line ${lines.position()} has more columns than headers.`;
        throw new TypeError(message);
      }
      lineObject[key] = value;
    }

    if (lineObject.priority === undefined) {
      lineObject.priority = 1;
    }

    const spec = validate(ruleSpecType, lineObject);
    // console.log(spec);
    const rule = parseRuleSpec(universe, spec);
    rules.push(rule);
  }

  return rules;
}

function skipComments(lines: PeekableSequence<string>) {
  while (!lines.atEOS()) {
    const line = lines.peek().trim();
    if (line.startsWith('#') || line.startsWith('remark') || line.length === 0) {
      lines.get();
    } else {
      break;
    }
  }
}

export function loadCsvRulesFile(
  universe: Universe,
  filename: string
): Rule[] {
  const text = fs.readFileSync(filename, 'utf-8');
  return loadCsvRulesString(universe, text);
}

export function loadCsvRulesString(
  universe: Universe,
  text: string
): Rule[] {
  // const rules: any[] = [];

  // await csv.parseFile(text, { headers: true })
  //   .on('error', error => {
  //     console.log(`error: ${error}`);
  //     throw error
  //   })
  //   .on('data', row => {
  //     // TODO: decide whether this check is appropriate.
  //     // Would we ever use csv format for denyOverride semantics?
  //     if (row.priority !== undefined) {
  //       const message = `Illegal column: "priority".`;
  //       throw new TypeError(message);
  //     }
  //     rules.push({ ...row, priority: 1 });
  //   })
  //   .on('end', (rowCount: number) => console.log(`Parsed ${rowCount} rows`));

  const rules = csv(
    text,
    {
      columns: true,
      // headers => {
      //   if (headers.includes('priority')) {
      //     const message = `Illegal column: "priority".`;
      //     throw new TypeError(message);
      //   }
      //   return [...headers, 'priority'];
      // },
      relax_column_count_less: true,
      skipEmptyLines: true,
      trim: true,
    }
  ).map((rule:any) => {
    if (rule.priority !== undefined) {
      const message = `Illegal column: "priority".`;
      throw new TypeError(message);
    }
    return {...rule, priority: 1};
  });

  const spec = validate(ruleSpecSetType, { rules });
  return spec.rules.map(r => parseRuleSpec(universe, r));

  //   return parseCsvStream(
  //     universe,
  //     csv.parseString(text, { headers: true })
  //   );
  }

  // export async function loadCsvRulesFile(
  //   universe: Universe,
  //   filename: string
  // ): Promise<Rule[]> {
  //   // const rules: any[] = [];

  //   // csv.parseFile(filename, { headers: true })
  //   // .on('error', error => {
  //   //   throw error
  //   // })
  //   // .on('data', row => {
  //   //   // TODO: decide whether this check is appropriate.
  //   //   // Would we ever use csv format for denyOverride semantics?
  //   //   if (row.priority !== undefined) {
  //   //     const message = `Illegal column: "priority".`;
  //   //     throw new TypeError(message);
  //   //   }
  //   //   rules.push({...row, priority: 1});
  //   // })
  //   // .on('end', (rowCount: number) => console.log(`Parsed ${rowCount} rows`));

  //   // const spec = validate(ruleSpecSetType, { rules });
  //   // return spec.rules.map(r => parseRuleSpec(universe, r));

  //   return parseCsvStream(
  //     universe,
  //     csv.parseFile(filename, { headers: true })
  //   );
  // }

  // async function parseCsvStream<I, O>(
  //   universe: Universe,
  //   parser: csv.CsvParserStream<I, O>
  // ): Promise<Rule[]> {
  //   const rules: any[] = [];

  //   await parser
  //     .on('error', error => {
  //       throw error
  //     })
  //     .on('data', row => {
  //       // TODO: decide whether this check is appropriate.
  //       // Would we ever use csv format for denyOverride semantics?
  //       if (row.priority !== undefined) {
  //         const message = `Illegal column: "priority".`;
  //         throw new TypeError(message);
  //       }
  //       rules.push({ ...row, priority: 1 });
  //     })
  //     .on('end', (rowCount: number) => console.log(`Parsed ${rowCount} rows`));

  //   const spec = validate(ruleSpecSetType, { rules });
  //   return spec.rules.map(r => parseRuleSpec(universe, r));
  // }

  export function loadYamlRulesFile(
    universe: Universe,
    filename: string
  ): Rule[] {
    console.log(`Load rules from "${filename}".`);

    const text = fs.readFileSync(filename, 'utf8');
    const root = yaml.safeLoad(text);
    const spec = validate(ruleSpecSetType, root);
    const rules = spec.rules.map(r => parseRuleSpec(universe, r));
    return rules;
  }

  export function loadYamlRulesString(
    universe: Universe,
    text: string
  ): Rule[] {
    const root = yaml.safeLoad(text);
    const spec = validate(ruleSpecSetType, root);
    const rules = spec.rules.map(r => parseRuleSpec(universe, r));
    return rules;
  }

  // TODO: Consider moving to Rule.constructor().
  export function parseRuleSpec(universe: Universe, spec: RuleSpec): Rule {
    const { action, priority, ...rest } = spec;
    let conjunction = Conjunction.create([]);

    for (const key of Object.getOwnPropertyNames(rest)) {
      const dimension = universe.get(key);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (rest as any)[key];
      if (typeof value !== 'string') {
        const message = `${key}: expected a string value.`;
        throw new TypeError(message);
      }
      conjunction = conjunction.intersect(dimension.parse(value));
    }

    return { action, priority, conjunction };
  }
