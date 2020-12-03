export enum FormatAttribution {
  RULE_ID,
  LINE_NUMBER,
}

export interface FormattingOptions {
  prefix?: string,
  attribution?: FormatAttribution,
}
