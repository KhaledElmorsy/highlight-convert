import createControllerView from '@settings/createControllerView';
import { mapUnitTemplate } from '@render/views/conversion/util';

/** @typedef {import('@domains/createDomain').default} createDomain */

/**
 * Create a standard {@link SettingsPage settings page} for domains created with the
 * {@link createDomain domain factory.}
 *
 * @param {ReturnType<createDomain>['controllers']} controllers
 * @param {string} name
 * @param {object} customization
 * @param {UnitGroup<Unit>[]} customization.groups
 * @param {{[unitID: string]: UnitConversionTemplate}} customization.unitTemplates
 * @returns {SettingsPage}
 */
export default function createDomainSettings(
  controllers,
  name,
  { unitTemplates = {}, groups = [] } = {}
) {
  const { render, converter } = controllers;
  /**
   *
   * @param {Unit} unit
   * @returns {UnitConversionTemplate & {group: string}}
   */
  const mapUnits = (unit) => {
    const template = mapUnitTemplate(unit, unitTemplates);
    const group = groups.find((group) => group.unitIDs.includes(unit.id))?.name;
    return { ...template, group };
  };

  const pickerSettings = {
    mapOptions: mapUnits,
    keys: {
      main: 'title',
      sub: 'subtitle',
      ...(groups.length ? { group: 'group' } : {}),
    },
  };

  return [
    {
      title: name,
      views: [
        {
          label: 'Main unit',
          description: 'Convert to this unit',
          view: createControllerView({
            controller: render.mainUnit,
            viewType: 'comboBox',
            viewSettings: pickerSettings
          }),
        },
        {
          label: 'Secondary unit',
          description: 'Convert the main unit to this unit',
          view: createControllerView({
            controller: render.secondaryUnit,
            viewType: 'comboBox',
            viewSettings: pickerSettings
          }),
        },
        {
          label: 'Favourites',
          view: createControllerView({
            controller: render.featuredUnits,
            viewType: 'comboBox',
            viewSettings: {
              multi: true,
              ...pickerSettings
            }
          }),
        },
      ],
    },
  ];
}
