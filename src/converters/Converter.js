import matchUnit from './util/matching/matchUnit';
import { featureUnits, roundAmounts, moveMainUnits } from './util/conversion';

/**
 * @template V
 * @typedef {object} ControllerStub
 * @prop {() => Promise<V>} get
 */

/**
 * @template U
 * @typedef {object} ConverterControllers<U>
 * @prop {ControllerStub<U>} [mainUnit]
 * @prop {ControllerStub<U>} [secondUnit]
 * @prop {ControllerStub<U[]>} [featuredUnits]
 * @prop {ControllerStub<number>} [decimals]
 * @prop {Object<U['id'], ControllerStub<U>} [labelDefaults]
 */

/**
 * Create a customizable quantity coverter. Initialize with units, rates, and it's
 * ready to go.
 *
 * Pass in controllers for extra functionality and feautres.
 *
 * Extend for more exotic use cases.
 * @template {Unit} U
 */
export default class Converter {
  /**
   * @param {object} args
   * @param {U[]} args.units
   * @param {Object<U['id'], number>} args.rates Object mapping each unit's ID to a relative
   * rate
   * @param {ConverterControllers<U>} [args.controllers] Customize how the converter matches and converts.
   *   #### Matches
   *   - Default unit for labels shared across multiple units
   *  #### Conversions
   *   - Number of decimal places
   *   - Featured set of units to bring to the front
   *   - Main and secondary unit to always put at the start
   * @param {object} [args.options]
   * @param {"left"|"right"} [options.numberSide = 'left'] Side to match number
   * the unit is between two numbers. Default: `left`.
   */
  constructor({
    units,
    rates,
    controllers = {},
    options: { numberSide = 'left' } = {},
  }) {
    /** @type {U[]} */
    this.units = units;
    this.rates = rates;
    this.controllers = controllers;

    /**
     * Number to choose when a unit is between 2 numbers. `20 usd 10` `:=` `20 usd`
     * @type {"left"|"right"}
     */
    this.numSide = numberSide;
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
   *
   * @param {*} match
   * @returns {Promise<boolean>}
   */
  async filterSharedLabels(match) {
    const { labelDefaults } = this.controllers;
    if (!labelDefaults) return true;

    const {
      unit,
      data: { unit: label },
    } = match;

    const labelController = labelDefaults[label];
    if (!labelController) return true;

    const defaultUnit = await labelController.get();
    return unit.id === defaultUnit.id;
  }

  /**
   * Hook into the main matcher and filter its matches before converting into
   * values
   * @param {{ unit:Unit, data: import('./util/matching/matchUnit').UnitMatch}} match
   * @returns {Promise<boolean>}
   */
  async filterMatches(match) {
    const filters = [this.filterSharedLabels];

    return await filters.reduce(async (keep, filter) => {
      return (await keep) && (await filter.call(this, match));
    }, Promise.resolve(true));
  }

  /**
   * Match all units and their relevant numbers in a string.
   *
   * Also return each match's index range.
   * @param {string} text
   * @returns {Promise<{range: MatchRange, value: Value<U>}[]>}
   */
  async match(text) {
    const matches = this.units.flatMap((unit) =>
      unit.labels.flatMap((label) =>
        matchUnit(text, label).map((match) => ({ unit, data: match }))
      )
    );
    /**
     * Units:         |------US Dollar------|   |-------British Pound-------|
     * Labels:          |---$---|   |-USD-|       |------GBP------|   |-£-|
     * LabelMatches:  [ [{match}] , [     ] ] , [ [{match},{match}] , [   ] ]
     * Flattened:              [{match:$},{match:GBP},{match:GBP}]
     */

    const filteredMatches = await Promise.all(
      matches.map(async (match) =>
        (await this.filterMatches(match)) ? match : false
      )
    ).then((matches) => matches.filter(Boolean));

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
   * Get the relative rates (scaling ratios) between units.
   *
   * Extracted for potentially fetched rates, like currency conversion rates.
   * @returns {Promise<Object<U['id'], number>>}
   */
  async getRates() {
    return this.rates;
  }

  /**
   * Just convert a value to the different units in this converter.
   *
   * Scales values linearly by default. Override for different conversion methods,
   * i.e. temperatures conversions involve shifting as well as sometimes scaling.
   * @param {Value} value
   * @returns {Promise<Value[]>}
   */
  async convertValue(value) {
    const { amount } = value;
    const rates = await this.getRates();
    const scalingFactor = amount / rates[value.unit.id];
    return this.units.map((unit) =>
      this.createValue({
        unit,
        amount: rates[unit.id] * scalingFactor,
      })
    );
  }

  /**
   * Get an array of converted values.
   *
   * The returned array is transformed according to the settings of the specific
   * converter instance.
   * @param {Value<U>} value The `unit` and `amount` to be converted.
   * @returns {Promise<Value<U>[]>}
   */
  async convert(value) {
    const conversions = await this.convertValue(value);
    const controllers = this.controllers;

    // Map relevant controllers to their values current values (if the controller exists)
    const { decimals, featuredUnits, mainUnit, secondUnit } =
      await Object.entries(controllers).reduce(
        async (acc, [key, controller]) => ({
          ...(await acc),
          [key]: await controller?.get(),
        }),
        Promise.resolve({})
      );

    // All the transformers accept values/conversions as their first argument
    function curry(t, ...args) {
      return (values) => t(values, ...args);
    }

    // [Test, Transformation]: Test passes ==> Apply transformation
    const transformations = [
      [controllers.decimals, curry(roundAmounts, decimals)],
      [controllers.featuredUnits, curry(featureUnits, featuredUnits)],
      [controllers.mainUnit, curry(moveMainUnits, value, mainUnit, secondUnit)],
    ];

    return transformations.reduce((conversions, [test, callback]) => {
      return test ? callback(conversions) : conversions;
    }, conversions);
  }
}
