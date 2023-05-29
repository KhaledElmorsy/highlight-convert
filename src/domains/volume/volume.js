import createDomain from '../createDomain';
import createUnitMap from '../util/createUnitMap';

export const unitMap = createUnitMap([
  ['ml', 'Milliliter'],
  ['l', 'Liter'],
  ['cm3', 'Cubic centimeter', ['cc']],
  ['m3', 'Cubic meter'],
  ['tsp', 'Teaspoon'],
  ['tbsp', 'Tablespoon'],
  ['fl oz', 'Fluid ounce', ['oz', 'fl. oz']],
  ['c', 'Cup'],
  ['pt', 'Pint'],
  ['qt', 'Quart'],
  ['gal', 'Gallon'],
  ['in3', 'Cubic inch'],
  ['ft3', 'Cubic foot'],
]);

const units = Object.values(unitMap);

/** Gallon to Liter */
const GAL_TO_L = 3.785411784;

const rates = {
  ml: GAL_TO_L * 1000,
  l: GAL_TO_L,
  cm3: GAL_TO_L * 1000,
  m3: GAL_TO_L / 1000,
  tsp: 768,
  tbsp: 256,
  'fl oz': 128,
  c: 16,
  pt: 8,
  qt: 4,
  gal: 1,
  in3: 231,
  ft3: 0.1336805556,
};

export const groups = [
  { name: 'Metric', unitIDs: ['ml', 'l', 'cm3', 'm3'] },
  {
    name: 'Imperial',
    unitIDs: ['tsp', 'tbsp', 'fl oz', 'c', 'pt', 'qt', 'gal', 'in3', 'ft3'],
  },
];

const { domain: volumne, controllers } = createDomain({
  id: 'volumne',
  units,
  converterConfig: {
    type: 'LinearConverter',
    setup: { rates },
  },
  renderConfig: {
    mainUnitID: 'ml',
    secondaryUnitID: 'c',
    featuredUnitIDs: ['tsp', 'tbsp', 'c', 'ml', 'l'],
    groups,
  },
});

export { controllers };
export default volumne;
