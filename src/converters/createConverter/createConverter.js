import { getCommonLabels } from './util/';
import { compactUnit } from '@util/misc';
import LinearConverter from '@converters/LinearConverter';
import CustomConverter from '@converters/CustomConverter';
import { mapKeys } from '@util/chrome/storage';
import { Picker } from '@settings/Controller';

/**
 * @template {Unit} U
 * @typedef {object} Constructors<U>
 * @prop {typeof LinearConverter<U>} LinearConverter
 * @prop {typeof CustomConverter<U>} CustomConverter
 */

const converters = {
  LinearConverter,
  CustomConverter,
};

/**
 * @template {keyof Constructors<U>} cType ConverterType
 * @template {Unit} U
 *
 * @typedef ConverterFactoryParams
 * @prop {string} id
 * @prop {U[]} units
 * @prop {cType} type Type of converter. Choice affects the `setup` parameter
 * @prop {SpecialParameters<Constructors<U>[cType]>} setup Required converter configuration
 * @prop {ConverterOptions<U>} [options]
 */

/**
 * Create a converter from different available types.
 *
 * Adapts the `setup` parameter depending on the chosen converter `type`.
 * @template {keyof Constructors<U>} cType ConverterType
 * @template {Unit} U
 * @param {ConverterFactoryParams<cType, U>}
 * @returns {{
 *    converter: InstanceType<Constructors<U>[cType]>,
 *    controllers: {
 *       labelDefaults: {[label: string]: Picker<U>}
 *    }
 * }}
 */
export default function createConverter({ id, units, type, setup, options }) {
  const converterConstructor = converters[type];
  const mapKey = mapKeys.new(id);
  const area = 'sync';

  // Get labels shared by multiple units and compile into a unit picker for each label
  const commonLabels = getCommonLabels(units);
  /** @type {Object<string, Picker<U>>} */
  const labelDefaultControllers = Object.entries(commonLabels).reduce(
    (acc, [label, labelUnits]) => {
      acc[label] = new Picker({
        area,
        key: mapKey(`labelDefaults.${label}`),
        options: labelUnits.map(compactUnit), // Remove unnecessary properties
        defaultValue: compactUnit(labelUnits[0]),
      });
      return acc;
    },
    {}
  );

  // Map pickers to simple chosen unit ID getters for the converter to use 
  /** @type {Object<string, labelDefaults<U>[string]>} */
  const labelDefaults = Object.entries(labelDefaultControllers).reduce(
    (acc, [label, controller]) => {
      acc[label] = async () => (await controller.get()).id;
      return acc;
    },
    {}
  );

  const converter = new converterConstructor({
    units,
    labelDefaults,
    ...setup,
    options,
  });

  const controllers = {
    labelDefaults: labelDefaultControllers,
  };

  // Return controller for rendering and testing
  return { converter, controllers };
}
