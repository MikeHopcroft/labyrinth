export enum FormatAttribution {
  RULE_ID,
  LINE_NUMBER,
}

export type AttributionFormatter<A> = (
  rules: Set<A>,
  prefix?: string
) => string[];

export interface FormattingOptions<A> {
  prefix?: string;
  attribution?: AttributionFormatter<A>;
}
