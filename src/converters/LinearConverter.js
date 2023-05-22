import Converter from './Converter';

/**
 * @template {Unit} U
 * @typedef {{[id in U['id']]: number}} Rates<U> */

/**
 * @template {Unit} U
 * @typedef {object} LinearConverterParams<U>
 * @prop {Rates<U>} [rates] Object mapping unit ID's to a set of normalized rates.
 *
 * Not required if a rates generator, `getRates`, is passed.
 * @prop {() => Promise<Rates<U>>} [getRates] Override default internal `rates` generation.
 *
 * By default, the rates passed during initialization are returned.
 *
 * Useful for unstable or contextual rates that could need runtime fetching or generation.
 */

/**
 * Create a {@link Converter} that converts values by scaling their amounts linearly
 * according to the relative rate between their units.
 * @template {Unit} U
 */
export default class LinearConverter extends Converter {
  /**
   * @param {ConverterParamters<U> & LinearConverterParams<U>} args
   */
  constructor({ units, rates, getRates, labelDefaults, options }) {
    super({ units, labelDefaults, options });
    if (rates === undefined && getRates === undefined) {
      throw new Error(
        'Linear converter initialized without rates or rate generator'
      );
    }
    this.getRates = getRates ?? (() => rates);
  }

  /**
   * Scale value vectors linearly according to a normalized set of relative rates.
   * @param {ValueVector} vector
   * @returns {Promise<ValueVector[]>}
   */
  async convertAll(vector, units) {
    const { amount } = vector;
    const rates = await this.getRates();
    const scalingFactor = amount / rates[vector.unit.id];
    return units.map((unit) => ({
      unit,
      amount: scalingFactor * rates[unit.id],
    }));
  }
}
