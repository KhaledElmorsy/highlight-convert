/**
 * Map labels shared by multiple units to an array of those units
 * @param {Unit[]} units
 * @returns {{[label: string]: string}}
 */
export default function getCommonLabels(units) {
  const labelMap = units.reduce((acc, unit) => {
    unit.labels.forEach((label) => {
      acc[label] ??= [];
      acc[label].push(unit);
    });
    return acc;
  }, {});

  const commonLabelMap = Object.entries(labelMap).reduce(
    (acc, [label, units]) => {
      if (units.length > 1) acc[label] = units;
      return acc;
    },
    {}
  );

  return commonLabelMap;
}
