import Converter from './Converter';

/**
 * @template {Unit} U
 * @typedef {object} CustomConverterParams<U>
 * @prop {Converter<U>['convertValue']} convertValue Conversion function to use.
 *
 * Ensure that it:
 *  - Converts from every defined unit, to every other defined unit.
 *  - Includes the original value in the array.
 */

/**
 * A {@link Converter} which which converts value vectors with a passed function.
 * @template {Unit} U
 */
export default class CustomConverter extends Converter {
  /** @param {ConverterParamters<U> & CustomConverterParams<U>} args */
  constructor({
    units,
    convertValue,
    controllers = {},
    options: { numberSide = 'left', caseSensitive = false } = {},
  }) {
    super({ units, controllers, options: { numberSide, caseSensitive } });
    this.convertValue = convertValue;
  }
}
