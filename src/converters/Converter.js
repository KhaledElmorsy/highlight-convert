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
 * @prop {Object<U['id'], ControllerStub<U>} [labelDefaults]
 */

/**
 * Create a customizable quantity coverter. Extend and override `convertUnit` for
 * different conversion methods.
 *
 * Can match units in an input string, return conversions and integrate different
 * functionality such as unit priority, and configurable amount rounding with optional
 * passed controllers.
 * @template {Unit} U
 */
export default class Converter {
  /**
   * @param {Object} args
   * @param {U[]} args.units
   * @param {ConverterControllers<U>} [args.controllers] Customize how the converter matches and converts.
   *   #### Matches
   *   - Default unit for labels shared across multiple units
   *  #### Conversions
   *   - Featured set of units to bring to the front
   *   - Main and secondary unit to always put at the start
   * @param {object} [args.options]
   * @param {"left"|"right"} [args.options.numberSide = 'left'] Side to match number
   * the unit is between two numbers. Default: `left`.
   * @param {boolean} [args.options.caseSensetive = false] Match label case. Default: `false`.
   * @param {boolean} [args.options.numberRequired = false] Match labels only when next to a number.
   * If `false` and a number isn't found, set amount to 1.
   *
   * Default: `false`
   */
  constructor({
    units,
    controllers = {},
    options: {
      numberSide = 'left',
      caseSensitive = false,
      numberRequired = false,
    } = {},
  }) {
    /** @type {U[]} */
    this.units = units;
    this.controllers = controllers;
    this.options = { numberSide, caseSensitive, numberRequired };
  }

  /**
   * Create an easily convertible `Value` object with an embedded `convert` method
   * from a  `ValueVector` with an `amount` and `unit`.
   * @param {U} unit
   * @param {number} amount
   * @returns {Value<U>}
   */
  createValue({ unit, amount }) {
    const vector = { unit, amount };
    return {
      ...vector,
      convert: () => this.convert(vector),
    };
  }

  /** @typedef {import('./util/matching/matchUnit').UnitMatch} UnitMatch */

  /**
   * Define which unit to match, when encountering a label that's shared between
   * mulitple units.
   * @param {UnitMatch} match
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
   * Return if a match has at least one neighboring number.
   * @param {UnitMatch} match
   * @returns {boolean}
   */
  filterNumberless(match) {
    return match.data.numLeft !== undefined || match.data.numRight !== undefined;
  }

  /**
   * Hook into the main matcher and filter its matches. Each match is passed
   * into this callback and filtered according to the returned boolean.
   * @param {UnitMatch} match
   * @returns {Promise<boolean>}
   */
  async filterMatches(match) {
    const filters = [
      this.filterSharedLabels,
      ...(this.options.numberRequired ? [this.filterNumberless] : []),
    ];

    return await filters.reduce(async (keep, filter) => {
      return (await keep) && (await filter.call(this, match));
    }, Promise.resolve(true));
  }

  /**
   * Match all units and their neighboring numbers, aka amounts, in a string.
   *
   * Each match is accompanied by its start and end indices in the input input string.
   * @param {string} text
   * @returns {Promise<Match<U>[]>>}
   */
  async match(text) {
    /**
     * Units:         |------US Dollar------|   |-------British Pound-------|
     * Labels:        | |---$---|   |-USD-| |   | |------GBP------|   |-£-| |
     * LabelMatches:  [ [{match}] , [     ] ] , [ [{match},{match}] , [   ] ]
     * Flatten x2:              [{match:$},{match:GBP},{match:GBP}]
     */
    const matches = this.units.flatMap((unit) =>
      unit.labels.flatMap((label) =>
        matchUnit(text, label, this.options.caseSensitive).map((match) => ({
          unit,
          data: match,
        }))
      )
    );

    const filteredMatches = await Promise.all(
      matches.map(async (match) =>
        (await this.filterMatches(match)) ? match : false
      )
    ).then((matches) => matches.filter(Boolean));

    // From matchUnit()'s return shape
    const numPositions = ['numLeft', 'numRight'];
    const [mainNum, otherNum] =
      this.options.numberSide === 'left'
        ? numPositions
        : numPositions.reverse();

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
   * Strictly convert a value vector to vectors of the converter's different units.
   * @abstract
   * @param {ValueVector<U>} value
   * @returns {Promise<ValueVector<U>[]>}
   */
  async convertValue(value) {}

  /**
   * Convert a value vector, `{unit: Unit, amount: number}` to an array of values.
   *
   * The value array is transformed depending on the controllers passed to the converter
   * instance. Relevant controllers are:
   *  - `mainUnit`
   *  - `secondUnit`
   *  - `featuredUnits[unit['id']]`
   * @param {ValueVector<U>} value The `unit` and `amount` to be converted.
   * @returns {Promise<Value<U>[]>}
   */
  async convert(inputVector) {
    const convertedVectors = await this.convertValue(inputVector);
    const values = convertedVectors.map((vector) => this.createValue(vector));
    
    const controllers = this.controllers;

    // Map relevant controllers to their values current values (if the controller exists)
    const { featuredUnits, mainUnit, secondUnit } =
      await Object.entries(controllers).reduce(
        async (acc, [key, controller]) => ({
          ...(await acc),
          [key]: await controller?.get?.(),
        }),
        Promise.resolve({})
      );

    // All the transformers accept values/conversions as their first argument
    function curry(t, ...args) {
      return (values) => t(values, ...args);
    }

    // [Test, Transformation]: Test passes ==> Apply transformation
    const transformations = [
      [controllers.featuredUnits, curry(featureUnits, featuredUnits)],
      [controllers.mainUnit, curry(moveMainUnits, inputVector, mainUnit, secondUnit)],
    ];

    return transformations.reduce((values, [test, callback]) => {
      return test ? callback(values) : values;
    }, values);
  }
}
