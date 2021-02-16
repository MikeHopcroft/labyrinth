import fs from 'fs';

export function readUtfFileSync(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

export function writeUtfFileSync(filePath: string, content: string) {
  fs.writeFileSync(filePath, content, 'utf8');
}

export function readFileSyncAs<T>(filePath: string): T {
  const content = readUtfFileSync(filePath);
  return JSON.parse(content) as T;
}
