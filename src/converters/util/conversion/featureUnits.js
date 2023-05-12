/**
 * Move a select set of values to the beginning of the value array.
 * @param {Value[]} values Values to sort
 * @param {Unit[]} featuredUnits Units of the values to move
 * @returns {Value[]}
 */
export default function featureUnits (values, featuredUnits) {
  return featuredUnits.length === 0
    ? conversions
    : values.reduce(
        (acc, val) =>
        featuredUnits.some(({ id }) => id === val.unit.id)
            ? [val, ...acc]
            : [...acc, val],
        []
      );
}
