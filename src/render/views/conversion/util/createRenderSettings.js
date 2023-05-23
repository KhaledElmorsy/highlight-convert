import { Picker, MultiPicker } from '@settings/Controller';
import { mapKeys } from '@util/chrome/storage';
import { compactUnit } from '@util/misc';

/**
 * @template {Unit} U
 * @typedef RenderSettingFactoryParams<U>
 * @prop {string} id Used to generate storage keys for the controllers
 * @prop {U[]} units
 */

/**
 * Generate a function that returns {@link ConversionRenderSettings conversion render settings}
 * and storage value controllers for those settings from an array of units.
 * @template {Unit} U
 * @param {RenderSettingFactoryParams<U> & ConversionRenderSettings<U>} args
 */
export default function createRenderSettings({
  units,
  id,
  groups,
  mainUnitID,
  secondaryUnitID,
  featuredUnitIDs,
  unitTemplates,
}) {
  const mapKey = mapKeys.new(id);
  const area = 'sync'; // Sync all controllers
  const getPath = (key) => ({ area, key: mapKey(key) });

  /** @type {U[]} */
  const compactUnits = units.map(compactUnit);
  const findCompactUnit = (id) => compactUnits.find((unit) => id === unit.id);

  const controllers = {
    mainUnit: new Picker({
      ...getPath('mainUnit'),
      options: compactUnits,
      defaultValue: findCompactUnit(mainUnitID),
    }),
    secondaryUnit: new Picker({
      ...getPath('secondaryUnit'),
      options: compactUnits,
      defaultValue: findCompactUnit(secondaryUnitID),
    }),
    featuredUnits: new MultiPicker({
      ...getPath('featuredUnits'),
      options: compactUnits,
      defaultValue: featuredUnitIDs.map(findCompactUnit),
    }),
  };

  async function getRenderSettings() {
    return {
      mainUnitID: (await controllers.mainUnit.get()).id,
      secondaryUnitID: (await controllers.secondaryUnit.get()).id,
      featuredUnitIDs: (await controllers.featuredUnits.get()).map(
        ({ id }) => id
      ),
      unitTemplates,
      groups,
    };
  }

  return { getRenderSettings, controllers };
}
