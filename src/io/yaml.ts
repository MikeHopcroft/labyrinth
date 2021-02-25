import * as yaml from 'js-yaml';
import {FileSystem, INodeSpecUniverse} from '..';

export function writeNodeGraphAsYamlFile(
  graph: INodeSpecUniverse,
  outfile: string
) {
  const yamlText = yaml.dump(graph);
  FileSystem.writeUtfFileSync(outfile, yamlText);
}

export function load(text: string): string | object | undefined {
  return yaml.safeLoad(text);
}
