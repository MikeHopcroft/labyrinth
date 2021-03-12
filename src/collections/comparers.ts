import {IComparer} from './specs';

class CaseInsensitive implements IComparer<string> {
  equals(inputX: string, inputY: string): boolean {
    return this.key(inputX) === this.key(inputY);
  }

  key(input: string): string {
    return input.toLowerCase();
  }
}

export const Comparers = {
  CaseInsensitive: new CaseInsensitive(),
};

export function equalsIgnoreCase(inputX: string, inputY: string): boolean {
  return inputX.toLowerCase() === inputY.toLowerCase();
}
