import createDomain from '../createDomain';
import createUnitMap from '../util/createUnitMap';

export const unitMap = createUnitMap([
  ['mm', 'Milimeter'],
  ['cm', 'Centimeter'],
  ['m', 'Meter'],
  ['km', 'Kilometer'],
  ['in', 'Inch', ['inches', '"']], // Matching auto checks label+'s' for plurals. Wouldnt match 'inches'
  ['mi', 'Mile'],
  ['yd', 'Yard'],
  ['ft', 'Feet', ['foot', "'"]],
]);

const units = Object.values(unitMap);

const rates = {
  m: 1,
  cm: 100,
  mm: 1000,
  km: 0.001,
  in: 39.37,
  ft: 3.281,
  yd: 1.09361,
  mi: 0.000621371,
};

export const groups = [
  { name: 'Metric', unitIDs: ['mm', 'cm', 'm', 'km'] },
  { name: 'Imperial', unitIDs: ['in', 'ft', 'yd', 'mi'] },
];

const { domain: length, controllers } = createDomain({
  id: 'length',
  units,
  converterConfig: {
    type: 'LinearConverter',
    setup: { rates },
  },
  renderConfig: {
    mainUnitID: 'cm',
    secondaryUnitID: 'in',
    groups,
  },
});

export { controllers };
export default length;
