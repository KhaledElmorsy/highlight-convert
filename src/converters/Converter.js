import matchUnit, {
  captureGroups as matchGroups,
} from './util/matching/matchUnit';
import numericQuantity from 'numeric-quantity';

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
   * @param {labelDefaults<U>} [args.labelDefaults] For common labels, return which
   * units to match them with.
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
    labelDefaults = {},
    options: {
      numberSide = 'left',
      caseSensitive = false,
      numberRequired = false,
    } = {},
  }) {
    /** @type {U[]} */
    this.units = units;
    this.labelDefaults = labelDefaults;
    this.options = { numberSide, caseSensitive, numberRequired };
    this.labels = new Set();
    this.labelMap = new Map();
    this.units.forEach((unit) => {
      unit.labels.forEach((label) => {
        this.labels.add(label);
        if (!this.labelMap.has(label)) {
          this.labelMap.set(label, [unit]);
        } else {
          this.labelMap.get(label).push(unit);
        }
      });
    });
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

  /**
   * @typedef {import('./util/matching/matchUnit').MatchData} MatchData
   * @typedef {{data: MatchData, unit: U, label: string}} UnitMatch
   */

  /**
   * Define which unit to match, when encountering a label that's shared between
   * mulitple units.
   * @param {UnitMatch} match
   * @returns {Promise<boolean>}
   */
  async filterSharedLabels(match) {
    if (!this.labelDefaults) return true;

    const { label, unit } = match;
    if (!Object.hasOwn(this.labelDefaults, label)) return true;

    const defaultUnitID = await this.labelDefaults[label]();
    return unit.id === defaultUnitID;
  }

  /**
   * Return if a match has at least one neighboring number.
   * @param {UnitMatch} match
   * @returns {boolean}
   */
  filterNumberless(match) {
    return (
      match.data.strings.numLeft !== undefined ||
      match.data.strings.numRight !== undefined
    );
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
    const matches = matchUnit(text, this.labels, this.options.caseSensitive);

    /** @type {UnitMatch[]} */
    const unitMatches = matches.flatMap((match) => {
      const { label } = match;
      const units = this.labelMap.get(label);
      return units.map((unit) => ({
        unit,
        label,
        data: match,
      }));
    });

    /** @type {UnitMatch[]} */
    const filteredMatches = await Promise.all(
      unitMatches.map(async (match) =>
        (await this.filterMatches(match)) ? match : false
      )
    ).then((matches) => matches.filter(Boolean));

    const [mainNum, otherNum] = (() => {
      const [left, right] = [matchGroups.numLeft, matchGroups.numRight];
      const leftPriority = this.options.numberSide === 'left';
      return leftPriority ? [left, right] : [right, left];
    })();

    const values = filteredMatches.map(({ unit, data }) => {
      const amount = (() => {
        const numberString = data.strings[mainNum] ?? data.strings[otherNum];
        if (numberString === undefined) return 1;
        
        const transformers = {
          removeCommas: (string) => string.replaceAll(',', ''),
        };

        const processed = Object.values(transformers).reduce(
          (str, func) => func(str),
          numberString
        );

        return numericQuantity(processed);
      })();

      // Merge match indices for the unit and relevant number
      const range = data.indices.fullLabel
        .concat(data.indices[mainNum] ?? data.indices[otherNum] ?? [])
        .sort((a, b) => a - b)
        .filter((_, i, arr) => i === 0 || i === arr.length - 1);

      return {
        value: this.createValue({ unit, amount }),
        range,
      };
    });
    return values;
  }

  /**
   * Convert a value vector to another a vector of a different unit.
   * @abstract
   * @param {ValueVector<U>} value
   * @param {U} unit
   * @returns {Promise<ValueVector<U>>}
   */
  async convertVector(value, unit) {}

  /**
   * Convert a vector to an array of vectors of multiple units.
   * @param {ValueVector<U>} inputVector
   * @param {U[]} units
   * @returns {Promise<ValueVector<U>[]>}
   */
  async convertAll(inputVector, units) {
    return await Promise.all(
      units.map((unit) => this.convertVector(inputVector, unit))
    );
  }

  /**
   * Convert a value vector, `{unit: Unit, amount: number}` to an array of values.
   * @param {ValueVector<U>} value The `unit` and `amount` to be converted.
   * @returns {Promise<Value<U>[]>}
   */
  async convert(inputVector) {
    const convertedVectors = await this.convertAll(inputVector, this.units);
    const values = convertedVectors.map(this.createValue.bind(this));
    return values;
  }
}
