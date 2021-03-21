import 'mocha';

import converters from './converters.test';
import shortener from './name_shortener.test';
import walk from './walk.test';

describe('Azure', () => {
  shortener();
  walk();
  converters();
});
