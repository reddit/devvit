/**
 * Validators
 *
 * This module provides all of the standard validator functions.  Validators are functions
 * that take in a valid JSON value and either produce a specific value type _or_ throw an error.
 *
 * ```ts
 * import { string, integer } from '@reddit/json-config/validators.js';
 *
 * string(1) === '1';
 * string({}); // throws!
 *
 * integer('1') === 1;
 * integer(4.20); // throws!
 * ```
 *
 * Validators are intended to be used to build up spec/schema objects for use with the
 * [`validateConfig`]('./index.html#validateConfig) function.
 *
 * @packageDocumentation
 */
import { validateConfig } from './index.js';

import type { Validator } from './index.js';
import type { JSONValue } from './index.js';
import type { ConfigSpec } from './index.js';
import type { ValidatedConfig } from './index.js';
import type { UnwrappedValidators } from './index.js';
import type { Unpacked } from './index.js';
import type { Literal } from './index.js';
import type { UnvalidatedJSONValue } from './index.js';

/**
 * A Validator that just validates that any value is defined.
 */
export const required: Validator<JSONValue & UnvalidatedJSONValue> = function defined(val) {
  if (typeof val === 'undefined') {
    throw new TypeError('required value is missing');
  }
  return val as typeof val & UnvalidatedJSONValue;
};

/**
 * A Validator for raw strings
 *
 * If a non-string value is configured, it will be cast as a string.
 */
export const string: Validator<string> = function string(val) {
  if (typeof val === 'undefined') {
    throw new TypeError('invalid string configured');
  }
  if (!val) {
    return '';
  }
  return val.toString();
};

/**
 * A Validator for floating-point numbers
 *
 * If a non-numeric value is configured, it will be cast to a string, then
 * parsed as a number using parseFloat.
 */
export const float: Validator<number> = function float(val) {
  if (typeof val === 'undefined') {
    throw new TypeError('invalid float configured');
  }
  if (typeof val === 'number') {
    return val;
  }
  if (!val) {
    return 0;
  }
  return parseFloat(val.toString());
};

/**
 * A Validator for integers
 *
 * Allows configuring numbers as strings, as longs as they parse as integers.
 *
 * Configured values that parse to a non-integer number will throw a RangeError,
 * and other configurued value types will throw a TypeError.
 */
export const integer: Validator<number> = function integer(val) {
  let casted: number;
  if (typeof val === 'number') {
    casted = val | 0;
  } else if (typeof val === 'string') {
    casted = parseInt(val, 10);
  } else {
    throw new TypeError('invalid integer configured');
  }
  if (casted != val) {
    throw new RangeError('expected an int');
  }
  return casted;
};

/**
 * A Validator for boolean values
 *
 * Allows any falsey value in addition to the string literal "false"
 */
export const boolean: Validator<boolean> = function boolean(val) {
  if (typeof val === 'undefined') {
    throw new TypeError('invalid boolean configured');
  }
  if (val === 'false') return false;
  return !!val;
};

/**
 * A Validator for spans of time
 *
 * This takes a string of the form '1 second' or '3 days' and returns an
 * integer representing that span of time in milliseconds.
 *
 * Throws a TypeError if a non-string value is configured, or if a value is
 * configured in the wrong format, or if the value references an unknown unit
 * of time.
 */
export const timespan: Validator<number> = function timespan(val) {
  if (typeof val !== 'string') {
    throw new TypeError('invalid timespan specified');
  }

  const parts = val.split(' ');
  if (parts.length !== 2) {
    throw new TypeError('invalid timespan specified');
  }
  const count = integer(parts[0]);
  let unit = parts[1];

  if (unit[unit.length - 1] === 's') {
    unit = unit.slice(0, unit.length - 1);
  }

  const scaleByUnit = {
    millisecond: 1,
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
  };

  if (!Object.prototype.hasOwnProperty.call(scaleByUnit, unit)) {
    throw new TypeError('unknown timespan unit');
  }

  // Typescript doesn't respect the hasOwnProperty check above
  return scaleByUnit[unit as keyof typeof scaleByUnit] * count;
};

/**
 * A Validator for a percentage
 *
 * This takes a string in fhe form of '37.2%' or '44%' and returns a float in
 * the range [0.0, 1.0].
 *
 * Throws a TypeError if a non-string value is configured, or if the value is
 * configured in the wrong format.  Throws a RangeError if the parsed value
 * is outside of the valid range.
 */
export const percent: Validator<number> = function percent(val: JSONValue) {
  if (typeof val !== 'string') {
    throw new TypeError('invalid percent specified');
  }

  if (val[val.length - 1] !== '%') {
    throw new TypeError('value specified is not a percent');
  }

  const percentage = float(val.slice(0, val.length - 1)) / 100;

  if (percentage < 0 || percentage > 1) {
    throw new RangeError('percentage is out of valid range');
  }

  return percentage;
};

/**
 * A ValidatorFactory for validating one of several choices.
 *
 * Values are validated exactly against the given options.  If values should be converted in the
 * parsed configuration, use `oneOfRecord` or `oneOfEnum` instead.
 *
 * ```typescript
 * validators.oneOf('foo', 'bar', 'baz');
 * ```
 */
export function oneOf<T>(...options: T[]): Validator<T> {
  return (val: JSONValue): T => {
    if (!options.includes(val as any)) {
      throw new RangeError('invalid option given');
    }
    return val as any as T;
  };
}

/**
 * A ValidatorFactory for validating one of several choices
 *
 * For each option, the key is what should be in the configuration file and
 * the value is what it is mapped to.
 *
 * E.g.
 *
 * ```typescript
 * validators.oneOfRecord({ hearts: 'H', spades: 'S' })
 * ```
 *
 * would parse `"hearts"` into `'H'`.
 *
 * Throws a TypeError if a non-string value is configured.  Throws a RangeError
 * if an invalid option is configured.
 */
export function oneOfRecord<T extends any>(options: Record<string, T>): Validator<T> {
  return (val): T => {
    if (typeof val !== 'string') {
      throw new TypeError('invalid oneOf specified');
    }

    if (!Object.prototype.hasOwnProperty.call(options, val)) {
      throw new RangeError('invalid option specified');
    }

    return options[val];
  };
}

// TODO typescript doesn't seem to support a way to do generic enums, i.e.
// no <T extends enum>, so I'm just forcing it for now.
/**
 * A ValidatorFactory for validationg a member of an enum
 */
export function oneOfEnum<T extends any>(options: T): Validator<T[keyof T]> {
  return oneOfRecord(options as Record<string, T[keyof T]>);
}

/**
 * A ValidatorFactory for an array of values specified by another validator
 *
 * At least one value must be provided. If you want an empty list to be a valid
 * choice, wrap with [optional](#optional).
 *
 * Throws a TypeError if a non-array value is configured.  Throws a RangeError
 * if the configured array is empty.
 */
export function array<T>(validator: Validator<T>): Validator<T[]> {
  return (val: JSONValue): T[] => {
    if (typeof val !== 'object' || !Array.isArray(val)) {
      throw new TypeError('invalid array specified');
    }
    if (!val.length) {
      throw new RangeError('no values provided to array');
    }

    const res: T[] = [];

    for (const item of val) {
      res.push(validator(item));
    }

    return res;
  };
}

/**
 * An option of type T1, or if that fails to parse, of type T2.
 *
 * This is useful for backwards-compatible configuration changes.  Catches any
 * errors thrown by the primary validator, but will throw any errors thrown by
 * the fallback validator.
 */
export function fallback<T1, T2>(
  validator: Validator<T1>,
  backup: Validator<T2>
): Validator<T1 | T2> {
  return (val: JSONValue): T1 | T2 => {
    try {
      return validator(val);
    } catch (err) {
      return backup(val);
    }
  };
}

/**
 * An option of type T, or the given default value if not configured.
 */
export function optional<T>(validator: Validator<T>, defaultVal: T): Validator<T> {
  return (val: JSONValue): T => {
    if (typeof val === 'undefined' || val === null || (Array.isArray(val) && !val.length)) {
      return defaultVal;
    } else {
      return validator(val);
    }
  };
}

/**
 * An object of type T, which should be a config spec.
 *
 * Normally you can just use objects directly in your config spec without needing to wrap them,
 * but this can be used to compose an object validator with other validators, e.g.
 *
 * ```typescript
 * const spec = {
 *   foo: {
 *     value: number,
 *   },
 *   bar: validators.optional(
 *    validators.object({
 *      value: string,
 *    }
 *   ),
 * }
 * ```
 */
export function object<T extends ConfigSpec>(configSpec: T): Validator<ValidatedConfig<T>> {
  return (val: JSONValue): ValidatedConfig<T> => {
    if (!(val && typeof val === 'object')) {
      throw new TypeError('non object type specified');
    }
    if (Array.isArray(val)) {
      throw new TypeError('invalid object type specified');
    }
    return validateConfig(val, configSpec);
  };
}

/**
 * An object of type T, which should be a config spec.  Valid values must not contain any additional
 * keys not defined in the config spec.
 *
 * ```typescript
 * const spec = {
 *   foo: validators.object({
 *     value: number,
 *   }),
 *   bar: validators.shape({
 *     value: number,
 *   }),
 * }
 * ```
 *
 * The `foo` key can be given any object as long as it contains a `value` key with a number value,
 * whereas the `bar` key will only validate with an object that _only_ has the `value` key.
 */
export function shape<T extends ConfigSpec>(configSpec: T): Validator<ValidatedConfig<T>> {
  const objectValidator = object(configSpec);
  return (val: JSONValue): ValidatedConfig<T> => {
    const validatedObject = objectValidator(val);
    // Rely on object validator to throw if val is not an object
    const valKeys = Object.keys(val as Object);
    for (const key of valKeys) {
      if (!Object.prototype.hasOwnProperty.call(configSpec, key)) {
        throw new TypeError(`invalid shape contains key "${key}" not found in config spec`);
      }
    }
    return validatedObject;
  };
}

/**
 * Use to validate an object as a Record<string, T>.  This is useful when your configuration object
 * can accept any arbitrary keys, but requires validation on their assigned values.
 *
 * ```typescript
 * const spec = {
 *   overrides: record(
 *     object({ name: string, value: required })
 *   ),
 * };
 * ```
 */
export function record<T>(validator: Validator<T>): Validator<Record<string, T | undefined>> {
  return (val: JSONValue) => {
    if (!val || typeof val !== 'object' || Array.isArray(val)) {
      throw new TypeError('invalid map type');
    }

    const res: Record<string, T> = {};
    for (const key in val) {
      res[key] = validator(val[key]);
    }
    return res;
  };
}

/**
 * A ValidatorFactory for a tuple of values of a specific length and type, defined by the
 * input validators.
 *
 * The tuple validator can be used for arrays with small, fixed sizes and varying types.  If you
 * need an array of a uniform type, use the `array` validator instead.
 *
 * ```typescript
 * const spec = {
 *   // "ALL" will be validated as an array with 2 values, a string and a boolean
 *   ALL: validators.tuple(string, boolean),
 * }
 * ```
 */
export function tuple<T extends any[]>(...validators: T): Validator<UnwrappedValidators<T>> {
  return (val: JSONValue): UnwrappedValidators<T> => {
    if (!(val && typeof val === 'object')) {
      throw new TypeError('non object type specified');
    }
    if (!Array.isArray(val)) {
      throw new TypeError('non array type specified');
    }
    if (val.length !== validators.length) {
      throw new RangeError('specified array has an invalid length');
    }
    const res = [];
    for (let i = 0; i < validators.length; i++) {
      res.push(validators[i](val[i]));
    }
    return res as UnwrappedValidators<T>;
  };
}

/**
 * A ValidatorFactory for validating against any number of validators.
 *
 * The result of the first validator that matches a value is returned.
 *
 * ```typescript
 * validators.any(
 *   validators.boolean,
 *   validators.number,
 *   validators.object({ value: validators.number }),
 * )
 * ```
 */
export function any<T extends any[]>(
  ...validators: T
): Validator<Unpacked<UnwrappedValidators<T>>> {
  return (val: JSONValue): Unpacked<UnwrappedValidators<T>> => {
    for (const v of validators) {
      try {
        return v(val) as Unpacked<UnwrappedValidators<T>>;
      } catch (err) {
        // eslint-disable-next-line no-empty
      }
    }
    throw new Error(`none of the given validators matched value ${JSON.stringify(val)}`);
  };
}

/**
 * A ValidatorFactory for validating that simple values match an exact expected value.
 *
 * For typescript to type this correctly, you will usually need to also pass the value as the type
 * argument.
 *
 * ```typescript
 * validators.identity<'foo'>('foo');
 * ```
 */
export function identity<T extends Literal>(match: Literal): Validator<T> {
  return (val: JSONValue): T => {
    if (val !== match) {
      throw new TypeError(`value ${val} does not match the expected value ${match}`);
    }
    return val as T;
  };
}
