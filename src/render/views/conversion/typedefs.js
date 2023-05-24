/**
 * @typedef UnitConversionTemplate Template used by the conversion component to render units.
 * @prop {string} title Main text
 * @prop {string} [subtitle] Thinner/lighter text rendered next to the main text
 * @prop {string} [image] Source of an image to render before the title. It will
 * be resized to a small logo/symbol.
 *
 * For unicode characters like emoji, add them directly to the `title` or `subtitle` strings.
 */

/**
 * @template {Unit} U
 * @typedef UnitGroup A named group of units with a defined order.
 * @prop {string} [name] Group name. Will be rendered as is. Can be ommitted.
 * @prop {U['id'][]} unitIDs Unit to include in the group. Units will be rendered
 * according to order in this array.
 */

/**
 * @template {Unit} U
 * @typedef ConversionRenderSettings Customize how conversions are rendered and ordered
 * @prop {U['id']} mainUnitID ID of the unit to be highlighted when converting from other units
 * @prop {U['id']} secondaryUnitID ID of the unit to highlight when converting from the main unit
 * @prop {U['id'][]} [featuredUnitIDs=[]] Array of IDs of the units to group and feature before other units
 * @prop {UnitGroup<U>[]} [groups=[]] Group units in sections and control their order.
 *
 * Groups will be rendered in the same order as this array.
 * Units in each group will maintain the same order as well.
 *
 * To control the order of the all units without grouping them under a specific name,
 * pass an array of one {@link UnitGroup} containing the units and without a `name` property.
 * @prop {{[unitID in U['id']]: UnitConversionTemplate}} [unitTemplates={}] Define how each 
 * unit should be rendered. If fully omitted or certain units are omit, units are rendered by default as:
 *
 * With name: `{title: unit.name, subtitle: unit.id}`
 *
 * Without name: `{title: unit.id}`
 */
