import { mapKeys } from '@util/chrome/storage';
import matchUnit from './util/matchUnit';

/**
 * Base class to extend for actual converters to use in the extension.
 * @template {Unit} U
 */
export default class Converter {
  /**
   * @param {Unit[]} units
   * @param {object} [options]
   * @param {"left"|"right"} [options.numberSide = 'left'] Number side to prioritize
   * when a unit is adjacent to two numbers. Default: `left`.
   *
   * i.e. `20 usd 40`;  `numberSide == left` => `20 usd`
   * @param {string} [options.storageKey] Outer key for data stored with the storage api.
   */
  constructor(units, { numberSide = 'left', storageKey } = {}) {
    /** @type {U[]} */
    this.units = units;

    /**
     * Number to choose when a unit is between 2 numbers. `20 usd 10` `:=` `20 usd`
     * @type {"left"|"right"}
     */
    this.numSide = numberSide;

    /** Map keys to the convereter's storage path */
    this.getStorageKey = mapKeys.new(`converters.${storageKey}`);
  }

  /**
   * Create a `Value` object with an inbuilt `convert` method for easily accessible 
   * conversions.
   * @param {U} unit
   * @param {number} amount
   * @returns {Value<U>}
   */
  createValue({ unit, amount }) {
    const value = { unit, amount };
    value.convert = this.convert.bind(this, value);
    return value;
  }

  /**
   * Hook into the main matcher and filter its matches before converting into
   * values
   * @param {{ unit:Unit, data: import('./util/matchUnit').UnitMatch}} match
   * @returns {Promise<boolean>}
   */
  async matchFilter(match) {
    return true;
  }

  /**
   * Match all units and their relevant numbers in a string.
   *
   * Also return each match's index range.
   * @param {string} text
   * @returns {Promise<{range: MatchRange, value: Value<U>}[]>}
   */
  async match(text) {
    const matches = this.units
      .map((unit) =>
        unit.labels.map((label) =>
          matchUnit(text, label).map((match) => ({ unit, data: match }))
        )
      )
      .flat(2);
    /**
     * Matches:  [ [{match}] , [     ] ] , [ [{match},{match}] , [   ] ]
     * Labels:     |---$---|   |-USD-|       |------GBP------|   |-£-|
     * Units:    |------US Dollar------|   |-------British Pound-------|
     *
     * Matches.flat(2): [{match:$},{match:GBP},{match:GBP}]
     */

    const filteredMatches = [];
    for(let match of matches) {
      if (await this.matchFilter(match)) filteredMatches.push(match)
    }

    // From matchUnit()'s return shape
    const numPositions = ['numLeft', 'numRight'];
    const [mainNum, otherNum] =
      this.numSide === 'left' ? numPositions : numPositions.reverse();

    const values = filteredMatches.map(({ unit, data }) => {
      const amount = parseFloat(data[mainNum] ?? data[otherNum] ?? 1);

      const range = ((indices) => {
        const sortedIndices = indices.unit
          .concat(indices[mainNum] ?? indices[otherNum] ?? []) // Only relevant number, if any
          .sort((a, b) => a - b);
        return [sortedIndices[0], sortedIndices.at(-1)];
      })(data.indices);

      return {
        value: this.createValue({ unit, amount }),
        range,
      };
    });

    return values;
  }

  /**
   * Convert a value to different values.
   * @param {Value<U>} value The `unit` and `amount` to be converted.
   * @returns {Promise<Value<U>[]>}
   */
  async convert(value) {}
}
