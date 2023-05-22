import Converter from './Converter';

/**
 * @template {Unit} U
 * @typedef {object} CustomConverterParams<U>
 * @prop {Converter<U>['convertVector']} [convertVector] Convert a vector to one of
 * a different unit. Invoked for each unit. Overrides `converter.convertAll()`
 *
 *
 * @prop {Converter<U>['convertAll']} [convertAll] Convert a value vector to all units in the
 * converter. Invoked once.
 *
 * Overrides `converter.convertAll()` which by default invokes `convertVector()`
 * for each unit of the converter.
 *
 * Use over `convertVector` to avoid repeating expensive processes for each unit.
 * i.e. Fetching external data for all units just once.
 */

/**
 * A {@link Converter} which which converts value vectors with injected functions.
 * @template {Unit} U
 */
export default class CustomConverter extends Converter {
  /** @param {ConverterParamters<U> & CustomConverterParams<U>} args */
  constructor({ units, convertVector, convertAll, controllers, options }) {
    if (convertAll === undefined && convertVector === undefined) {
      throw new Error('Custom converters must override a conversion method');
    }
    super({ units, controllers, options });
    if (convertAll !== undefined) this.convertAll = convertAll;
    if (convertVector !== undefined) this.convertVector = convertVector;
  }
}
