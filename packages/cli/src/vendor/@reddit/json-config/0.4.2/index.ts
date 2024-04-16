/**
 * Config validation utility
 *
 * This module provides configuration value parsing and validation.
 *
 * This module can be used to validate the structure of parsed JSON or plain JS object structure
 * against a specified validation schema.  The `validateConfig` method will return a valid, typed
 * object given an input object, or throw an error if validation fails.
 *
 * All of the validator methods are also exported as members of the exported `validators` object
 * for convenience, so you can just `import { validators } from '@reddit/faceplate/lib/config';`.
 *
 * Example JSON config file:
 *
 * ```json
 * {
 *   "simple": true,
 *   "cards": ["clubs", "spades", "diamonds"],
 *   "nested": {
 *     "once": 1,
 *     "really": {
 *       "deep": "3 seconds"
 *     }
 *   },
 *   "sampleRate": "37.1%",
 *   "interval": "30 seconds"
 * }
 * ```
 *
 * Then:
 *
 * ```typescript
 * import { validateConfig} from '@reddit/json-config.js';
 * import * as v from '@reddit/json-config/validators.js';
 *
 * import rawConfig from "./example/config.json"
 *
 * const config = validateConfig(rawConfig, {
 *   simple: v.boolean,
 *   cards: v.array(v.oneOfRecord({
 *     clubs: 1,
 *     spades: 2,
 *     diamonds: 3,
 *     hearts: 4,
 *    })),
 *   nested: {
 *     once: v.integer,
 *     really: {
 *       deep: v.timespan,
 *     },
 *   },
 *   optional: v.optional(v.integer, 9001),
 *   sampleRate: v.percent,
 *   interval: v.fallback(v.timespan, v.integer),
 * });
 * ```
 *
 * @packageDocumentation
 */

/** A string, number, or boolean literal value. */
export type Literal = string | number | boolean;

/** Given an array of type T, returns type T */
export type Unpacked<T> = T extends (infer U)[] ? U : T;

/**
 * Takes an array of Validators of type T, returning an array of type T.
 *
 * ```typescript
 * type MyValidators = [Validator<string>, Validator<boolean>];
 * type MyValidatorTypes = UnwrappedValidators<MyValidators>;
 * // equivalent to [string, boolean];
 * ```
 */
export type UnwrappedValidators<T extends any[]> = {
  [P in keyof T]: T[P] extends Validator<infer U> ? U : never;
};

/**
 * An array parsed from valid JSON.
 */
export interface JSONArray extends Array<JSONValue> {}

/**
 * A value parsed from valid JSON.
 */
export type JSONValue = string | number | JSONObject | JSONArray | boolean | null;

/**
 * A JSON-serializeable object.
 */
export interface JSONObject {
  [key: string]: JSONValue;
}

/**
 * A validator function used to parse and/or validate a config value.
 *
 * Validators handle a single value from a configuration object.  They either
 * parse a value from one type (typically a string) into a specific format,
 * validate the type of the value, or do both.
 */
export type Validator<T> = (val: JSONValue) => T;

/**
 * A factory function that produces a validator given some input configuration.
 */
export type ValidatorFactory<C extends any, T> = (config: C) => Validator<T>;

/**
 * A configuration specification object, used by the
 * [validateConfig](#validateConfig) function.
 *
 * An object mapping keys to validator functions that will be use to validate
 * those keys in a passed JSON config object.  Values can also be nested
 * [ConfigSpec](#ConfigSpec) objects, allowing validation of nested config
 * structures.
 */
export interface ConfigSpec {
  [key: string]: SpecValue;
}

/**
 * A valid value in a [ConfigSpec](#ConfigSpec) object.
 */
export type SpecValue = Validator<any> | ConfigSpec | any;

const RequiredSymbol = Symbol('json');

/**
 * This is a hack to allow the ValidatedConfig type to return something clean when the
 * `required` validator is used.
 */
export type UnvalidatedJSONValue = {
  [RequiredSymbol]: never;
};

type ValidatedValue<T> =
  // This case is to handle the `v.required` validator specifically.
  // The type output of `v.required` gets ugly without this, because there's a lot of overlap with
  // the `JSONValue` type and the type of config spec objects.  We can't really just check
  // `T extends JSONValue` because nested config objects will match against that.  To work around
  // it, the return type of `v.required` includes this sentinal type that can be used to catch the
  // type here and return the plain `JSONValue` type.
  T extends UnvalidatedJSONValue
    ? JSONValue
    : T extends Literal | null
    ? T
    : ValidatedConfigProperty<T>;

type ValidatedConfigProperty<T> =
  // If it's a validator, extract the return type of the validator
  // This could be a simple type (e.g. boolean), or something more complex like another validator,
  // a config spec object, an array of types, etc.
  T extends Validator<infer U>
    ? ValidatedValue<U>
    : // If it's an object that's the result of a validation function (e.g. v.object), then we need to
    // map over its properties and unravel them.
    // If this property is a validator, use it's return type.  Otherwise, use the type directly.
    T extends ValidatedConfig<infer U> | ConfigSpec
    ? {
        [P in keyof U]: U[P] extends Validator<infer V> ? ValidatedValue<V> : ValidatedValue<U[P]>;
      }
    : // Arrays should be passed through as-is, as by the time we get here, validators should be
    // completely stripped out
    T extends []
    ? T
    : // This is reached if someone defines a spec type in an unsupported format, e.g.
      // `{ foo: v.string, bar: 'literal string' }.
      never;

/**
 * A parsed and validated configuration object produced by [validateConfig](#validateConfig).
 */
export type ValidatedConfig<T extends ConfigSpec> = {
  [P in keyof T]: ValidatedConfigProperty<T[P]>;
};

/**
 * @ignore
 */
function isSpecValueAValidator(val: SpecValue): val is Validator<any> {
  return typeof val === 'function';
}

/**
 * @ignore
 */
function isConfigValueAJSONObject(val: JSONValue): val is JSONObject {
  return !!val && typeof val === 'object' && !Array.isArray(val);
}

function _validateConfig<T extends ConfigSpec>(
  unvalidatedConfig: JSONObject,
  configSpec: T,
  keyPath: string[]
): ValidatedConfig<T> {
  const validated = {} as ValidatedConfig<typeof configSpec>;

  if (
    !unvalidatedConfig ||
    typeof unvalidatedConfig !== 'object' ||
    Array.isArray(unvalidatedConfig)
  ) {
    throw new TypeError('not an object');
  }

  for (const key in configSpec) {
    keyPath.push(key);
    const specValue: SpecValue = configSpec[key];
    if (isSpecValueAValidator(specValue)) {
      validated[key] = specValue(unvalidatedConfig[key]);
    } else if (Object.prototype.hasOwnProperty.call(unvalidatedConfig, key)) {
      const subConfig = unvalidatedConfig[key];
      if (
        typeof subConfig === 'string' ||
        typeof subConfig === 'number' ||
        typeof subConfig === 'boolean'
      ) {
        validated[key] = subConfig as any;
      } else if (isConfigValueAJSONObject(subConfig)) {
        const res: ValidatedConfig<ConfigSpec> = _validateConfig(
          subConfig,
          specValue as ConfigSpec,
          keyPath
        );
        validated[key] = res as any; // TODO not sure how to type this
      } else {
        throw new TypeError(`invalid config for ${key}`);
      }
    } else {
      throw new TypeError(`expected config section ${key} not found`);
    }
    keyPath.pop();
  }

  return validated;
}

/**
 * Parse and validate a raw JSON config object.
 *
 * Passes an object parsed from raw JSON through additional parsers/validators
 * specific to part of the application.  The returned object should retain
 * type information based on the interface of the passed `configSpec`.
 *
 * @param unvalidatedConfig An object parsed from valid JSON.
 * @param configSpec An object specifying the shape of the expected config.
 */
export function validateConfig<T extends ConfigSpec>(
  unvalidatedConfig: JSONObject,
  configSpec: T
): ValidatedConfig<T> {
  const keyPath: string[] = [];
  try {
    return _validateConfig(unvalidatedConfig, configSpec, keyPath);
  } catch (err) {
    if (err instanceof Error && keyPath.length) {
      err.message = `Error in key path "${keyPath.join('.')}": ${err.message}`;
    }
    throw err;
  }
}
