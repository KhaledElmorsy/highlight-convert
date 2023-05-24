import createConverter from '@converters/createConverter/createConverter';
import { createRenderSettings } from '@render/views/conversion/util';
import Domain from './Domain';
import { mapKeys } from '@util/chrome/storage';

export const registeredIDs = new Set();

/**
 * Configure and instantiate a {@link Domain} object. 
 * 
 * Dependencies are initlialized based on the specified configuration, and relevant 
 * controller instances are returned in a `controllers` object.
 * @template {Unit} U
 * @template {ConverterTypeName<U>} cType
 * @param {object} args
 * @param {string} args.id
 * @param {U[]} args.units
 * @param {Omit<ConverterFactoryParams<cType, U>,'units'|'id'>} args.converterConfig
 * @param {ConversionRenderSettings<U>} args.renderConfig
 */
export default function createDomain({
  id,
  units,
  converterConfig,
  renderConfig,
}) {
  if(registeredIDs.has(id)) {
    throw new Error(`A domain has already been cerated with the ID: ${id}`)
  }

  registeredIDs.add(id);
  const mapKey = mapKeys.new(id);

  const { getRenderSettings, controllers: renderSettingsControllers } =
    createRenderSettings({
      id: mapKey('renderSettings'),
      units,
      ...renderConfig,
    });

  const { converter, controllers: converterControllers } = createConverter({
    id: mapKey('converter'),
    units,
    ...converterConfig,
  });

  const domain = new Domain({
    match: converter.match.bind(converter),
    convert: converter.convert.bind(converter),
    getRenderSettings,
  });

  return {
    domain,
    controllers: {
      render: renderSettingsControllers,
      converter: converterControllers,
    },
  };
}
