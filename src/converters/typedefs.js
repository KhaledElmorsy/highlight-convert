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
 * @typedef {Object} Value<U> An amount of a unit
 * @prop {U} unit
 * @prop {number} amount
 * @prop {()=>Promise<Value[]>} convert Convert the value to all relevant units
 * @template {Unit} U
 */

/**
 * @typedef {Object} MatchRange
 * Indices of the matched value in the input string.
 * @prop {number} start Index of the start of the unit value
 * @prop {number} end Index (excl.) of the end of the unit value
 */

/**
 * @template {Unit} U
 * @typedef {Object} Match<U> A matched value returned by a converter
 * @prop {MatchRange} range Start and end indices of the match in the input string
 * @prop {Value<U>} value Unit and amount of the matched value
 */
