import createDomain from '../createDomain';
import createUnitMap from '../util/createUnitMap';

export const unitMap = createUnitMap([
  ['µg', 'Microgram', ['mcg']],
  ['mg', 'Miligram'],
  ['g', 'Gram'],
  ['kg', 'Kilogram'],
  ['oz', 'Ounce'],
  ['lb', 'Pound'],
  ['st', 'Stone'],
]);

const units = Object.values(unitMap);

const rates = {
  µg: 1000000,
  mg: 1000,
  g: 1,
  kg: 0.001,
  oz: 0.035274,
  lb: 0.00220462,
  st: 0.000157473,
};

const groups = [
  { name: 'Metric', unitIDs: ['µg', 'mg', 'g', 'kg'] },
  { name: 'Imperial', unitIDs: ['oz', 'lb', 'st'] },
];

const { domain: weight, controllers } = createDomain({
  id: 'weight',
  units,
  converterConfig: {
    type: 'LinearConverter',
    setup: { rates },
    options: {
      numberRequired: true,
    },
  },
  renderConfig: {
    mainUnitID: 'kg',
    secondaryUnitID: 'lb',
    featuredUnitIDs: ['g', 'kg', 'oz', 'lb'],
    groups,
  },
});

export { controllers };
export default weight;
