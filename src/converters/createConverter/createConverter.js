import LinearConverter from '@converters/LinearConverter';
import CustomConverter from '@converters/CustomConverter';
import { MultiPicker, Picker, Range } from '@settings/Controller/';
import { mapKeys } from '@/util/chrome/storage';

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
 * Create a converter from different available types.
 *
 * Adapts the `setup` parameter depending on the chosen converter `type`.
 *
 * Handles controller creation, customization and injection.
 *
 * @template {keyof Constructors<U>} cType ConverterType
 * @template {Unit} U
 * @param {object} args
 * @param {string} args.id Root for controller storage keys
 * @param {U[]} args.units
 * @param {cType} args.type Type of converter. Choice affects the `setup` parameter
 * @param {SpecialParameters<Constructors<U>[cType]>} args.setup Required converter configuration
 * @param {ConverterOptions<U>} [args.options]
 * @param {ControllerSettings<U>} args.controllerSettings
 * @returns {InstanceType<Constructors<U>[cType]>}
 */
export default function createConverter({
  id,
  units,
  type,
  setup,
  options,
  controllerSettings,
}) {
  const converter = converters[type];
  const area = 'sync';
  const mapKey = mapKeys.new(id);

  const {
    mainUnit,
    secondUnit,
    featuredUnits = [],
    labelDefaults = {},
  } = controllerSettings;

  /** Only keep fields for identification and rendering, to reduce sync storage space req. */
  const compactUnits = units.map(({ id, name = null }) => ({
    id,
    name,
  }));

  const getCompactUnit = (unit) =>
    compactUnits.find(({ id }) => id === unit.id);

  const controllers = {
    mainUnit: new Picker({
      area,
      key: mapKey('mainUnit'),
      options: compactUnits,
      defaultValue: getCompactUnit(mainUnit),
    }),
    secondUnit: new Picker({
      area,
      key: mapKey('secondUnit'),
      options: compactUnits,
      defaultValue: getCompactUnit(secondUnit),
    }),
    featuredUnits: new MultiPicker({
      area,
      key: mapKey('featuredUnits'),
      options: compactUnits,
      defaultValue: featuredUnits.map(getCompactUnit),
    }),
    labelDefaults: Object.entries(labelDefaults).reduce(
      (acc, [label, { options, default: defaultValue }]) => ({
        ...acc,
        [label]: new Picker({
          area,
          key: mapKey(`labelDefaults.${label}`),
          options: options.map(getCompactUnit),
          defaultValue: getCompactUnit(defaultValue),
        }),
      }),
      {}
    ),
  };

  return new converter({ units, controllers, ...setup, options });
}
