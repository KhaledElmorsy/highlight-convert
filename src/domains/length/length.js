import createDomain from '../createDomain';
import createUnitMap from '../util/createUnitMap';

export const unitMap = createUnitMap([
  ['m', 'meter'],
  ['cm', 'centimeter'],
  ['km', 'kilometer'],
  ['mm', 'milimeter'],
  ['in', 'inch', ['inches']], // Matching auto checks label+'s' for plurals. Wouldnt match 'inches'
  ['mi', 'mile'],
  ['yd', 'yard'],
  ['ft', 'feet', ['foot']],
  ['thou', null, 'mil'],
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
  thou: 39370.1,
};

export const groups = [
  { name: 'Metric', unitIDs: ['mm', 'cm', 'm', 'km'] },
  { name: 'Imperial', unitIDs: ['thou', 'in', 'ft', 'yd', 'mi'] },
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
