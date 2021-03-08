import {assert} from 'chai';
import 'mocha';
import {normalizedSymbolKey} from '../../../src/conversion/azure/formatters';

describe('Azure - Key Tests', () => {
  it('Simple key construction', () => {
    const expected = 'test_ServiceTag_275756';
    const input = 'test';
    const result = normalizedSymbolKey(input);
    assert.equal(result, expected);
  });

  it('Tail of long path is used', () => {
    const expected = 'path_long_ServiceTag_071630';
    const input = '/this/is/a/long/path';
    const result = normalizedSymbolKey(input);
    assert.equal(result, expected);
  });

  it('Dashes - in symbol are replaced with underscore _', () => {
    const expected = 'name_with_dash_ServiceTag_c1cb8e';
    const input = 'name-with-dash';
    const result = normalizedSymbolKey(input);
    assert.equal(result, expected);
  });

  it('Asterisk * in symbol are replaced with underscore _', () => {
    const expected = 'name_with_dash_ServiceTag_3cea7e';
    const input = 'name*with*dash';
    const result = normalizedSymbolKey(input);
    assert.equal(result, expected);
  });
});
