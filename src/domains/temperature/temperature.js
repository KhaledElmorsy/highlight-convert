import CustomConverter from '@converters/CustomConverter';
import createDomain from '../createDomain';
import createUnitMap from '@domains/util/createUnitMap';

export const unitMap = createUnitMap([
  [
    'c',
    'Celsius',
    ['°C', '° C', 'centigrade', 'degrees Celsius', 'degree Celsius'],
  ],
  ['f', 'Fahrenheit', ['°F', '° F', 'degrees Fahrenheit', 'degree Fahrenheit']],
  ['k', 'Kelvin'],
]);

/** @type {Unit[]} */
const units = Object.values(unitMap);

/** @type {CustomConverter<Unit>['convertVector']} */
function convertVector(inputVector, unit) {
  const toC = {
    c: (c) => c,
    k: (k) => k - 273.15,
    f: (f) => ((f - 32) * 5) / 9,
  }[inputVector.unit.id];

  const fromC = {
    c: (c) => c,
    k: (c) => c + 273.15,
    f: (c) => (c * 9) / 5 + 32,
  }[unit.id];

  const celsiusAmount = toC(inputVector.amount);
  const amount = fromC(celsiusAmount);

  return { amount, unit };
}

const { domain: temperature, controllers } = createDomain({
  id: 'temperature',
  units,
  converterConfig: {
    type: 'CustomConverter',
    setup: { convertVector },
    options: {
      numberRequired: true,
    },
  },
  renderConfig: {
    mainUnitID: 'c',
    secondaryUnitID: 'f',
    unitTemplates: units.reduce(
      (acc, { id, name }) => ({
        ...acc,
        [id]: {
          title: name,
          subtitle: id.toUpperCase(),
        },
      }),
      {}
    ),
  },
});

export { controllers };
export default temperature;
