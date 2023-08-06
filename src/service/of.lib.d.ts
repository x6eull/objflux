/* eslint-disable @typescript-eslint/no-unused-vars */

declare type StringRestriction = {
  // length?: number | [number?, number?];
  maxLength?: number;
  minLength?: number;
  validate?: string;
  multiLine?: boolean;
};
declare type OfString<_T extends StringRestriction> = string;

declare type NumberRestriction = {
  integer?: boolean,
  // value?: [number?, number?],
  maxValue?: number,
  minValue?: number
}
declare type OfNumber<_T extends NumberRestriction> = number;