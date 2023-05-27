/** 
 * @typedef {object} NumberRange
 * 
 * A range's width `(max - min)` must be divisible by its `step`
 * @prop {number} min
 * @prop {number} max
 * @prop {number} step Must be:
 * - `> 0`
 * - `< max - min // Width`
 */


/**
 * @template {Unit} U
 * @typedef {import("@domains/Domain").default<U>} Domain<U>
 */
