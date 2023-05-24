/**
 * @typedef {{[id: string]: number}} Rates
 * An object mapping currency IDs and their conversion value from 1 USD.
 * 
 * ```js
 * rates: {usd: 1, egp: 30, eur: 0.9}
 * ```
 */

/**
 * @typedef {object} RateCache
 * @prop {string} date Request date
 * @prop {Rates} rates
 */
