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
 * A converter which uses a passed function to convert values.
 * @tempalte {Unit} U
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
    this.convertValue = async (value) =>
      (await convertValue(value)).map(v => this.createValue(v));
  }
}
