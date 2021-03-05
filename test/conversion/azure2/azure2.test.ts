import 'mocha';

import converters from './converters.test';
import shortener from './name_shortener.test';
import walk from './walk.test';

describe('AZURE2', () => {
  shortener();
  walk();
  converters();
});
