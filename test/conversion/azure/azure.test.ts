import 'mocha';

import allocator from './address_allocator.test';
import converters from './converters.test';
import shortener from './name_shortener.test';
import walk from './walk.test';
import synthetics from './sythesized_resources.test';

describe('Azure', () => {
  allocator();
  shortener();
  walk();
  converters();
  synthetics();
});
