/**
   * Map a unit to its defined or default {@link UnitConversionTemplate unitTemplate}.
   *
   * #### Defaults, 
   * *Also defined {@link ConversionRenderSettings.unitTemplates here}*
   *
   * With name: `{title: unit.name, subtitle: unit.id}`
   *
   * Without name: `{title: unit.id}`
   * @param {Unit} inputUnit
   * @param {UnitConversionTemplate} unitTemplate
   * @returns {UnitConversionTemplate}
   */
export default function mapUnitTemplate({ id, name }, unitTemplates) {
  const hasName = name !== undefined;
  return (
    unitTemplates[id] ??
    (hasName ? { title: name, subtitle: id } : { title: id })
  );
}
