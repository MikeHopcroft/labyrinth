import fs from 'fs';

export function readUtfFileSync(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

export function writeUtfFileSync(filePath: string, content: string) {
  fs.writeFileSync(filePath, content, 'utf8');
}
