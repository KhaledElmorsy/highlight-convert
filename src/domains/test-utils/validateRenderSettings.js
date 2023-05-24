/**
 * Assert that all unit IDs in a render settings object belong to units in a
 * specified set.
 * @param {ConversionRenderSettings<Unit>} renderSettings
 * @param {{[id: string]: Unit}} unitMap
 */
export default function validateRenderSettings(renderSettings, unitMap) {
  const checkID = (id) => expect(Object.hasOwn(unitMap, id)).toBeTruthy();
  for (let [key, value] of Object.entries(renderSettings)) {
    switch (key) {
      case 'mainUnitID':
      case 'secondaryUnitID':
        checkID(value);
        break;
      case 'featuredUnitIDs':
        value.forEach(checkID);
        break;
      case 'groups':
        value.forEach((group) => {
          group.unitIDs.forEach(checkID);
        });
        break;
      case 'unitTemplates':
        Object.keys(value).forEach(checkID);
      // no-default
    }
  }
}
