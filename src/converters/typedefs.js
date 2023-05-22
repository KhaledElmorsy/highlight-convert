/**
 * @typedef {object} Unit
 * @prop {string} id
 * @prop {string[]} labels Strings to look for when matching selected text
 * @prop {string} [name] Optional name to render.
 * @prop {string[]} [group] Heirarchy to group units together. Useful for converting only relevant units.
 * Can also be rendered as groups.
 * @prop {object} [symbol] Sy,bol to render for the unit.
 * @prop {string} [symbol.image] Name & extension of the relevant image file
 * @prop {string} symbol.alt Text (emoji pref.) alternative to the image
 */

/**
 * @template {Unit} U
 * @typedef {typeof import('./Converter').default<U>} ConverterConstructor<U>
 */

/**
 * @template {Unit} U
 * @typedef {ConstructorParameters<ConverterConstructor<U>>['0']} ConverterParamters<U>
 */

/**
 * @template {Unit} U
 * @typedef {InstanceType<ConverterConstructor<U>>} Converter<U>
 */

/**
 * @template {Unit} U
 * @typedef {Object} ValueVector<U> An amount of a unit
 * @prop {U} unit
 * @prop {number} amount
 */

/**
 * @template {Unit} U
 * @typedef {ValueVector<U> & {convert: () => ReturnType<Converter<U>['convert']>}} Value<U> A value vector with a
 * method, `convert`, that returns equivalent `Values` of relevant units.
 */

/**
 * @template {Unit} U
 * @typedef {Object} Match<U> A matched value returned by a converter
 * @prop {[number, number]} range Start and end (excl.) indices of the match in the input string, including the number.
 * @prop {Value<U>} value Unit and amount of the matched value
 */

/** @typedef {'@settings/Controller/Controller'} Controller */

/**
 * @template {Unit} U
 * @typedef {{[label: string]: () => Promise<U['id']>}} labelDefaults<U>
 */
