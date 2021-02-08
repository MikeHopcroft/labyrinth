import * as yaml from 'js-yaml';

import {convert} from '../converter';

const graph = convert('junk/resource-graph.json', 'junk/resource-graph.yaml');

console.log('====================================');
console.log(yaml.dump(graph));
