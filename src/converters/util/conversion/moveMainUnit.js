/**
 * Move the Value of a specific unit to the beginning of the array. If source value
 * was of that main unit, move a secondary unit to the front instead.
 * 
 * If a secondary unit isnt passed, returns the same array if converting from the 
 * main value.
 *
 * Example:

 * `mainUnit == usd` `secondUnit == gbp`
 * - `input == eur` → `Values == [usd, ...rest]`
 * - `input == jpy` → `Values == [usd, ...rest]`
 * - `input == usd` → `Values == [gbp, ...rest]`
 * @param {Value[]} values
 * @param {Value} inputValue
 * @param {Unit} mainUnit
 * @param {Unit} [secondUnit]
 * @returns {Value[]}
 */
export default function moveMainUnits(
  values,
  inputValue,
  mainUnit,
  secondUnit = {}
) {
  const firstResultID =
    inputValue.unit.id === mainUnit.id ? secondUnit.id : mainUnit.id;

  if (firstResultID === undefined) return values;

  return values.reduce(
    (acc, val) =>
      val.unit.id === firstResultID ? [val, ...acc] : [...acc, val],
    []
  );
}
