import getCommonLabels from '../getCommonLabels';

it('Returns an object with duplicate labels as keys and an array of their units as values', () => {
  const unitMap = {
   usd: { id: 'usd', name: 'US dollar', labels: ['$', 'usd'] },
   gbp: { id: 'gbp', name: 'Pound Sterling', labels: ['£', 'gbp'] },
   egp: { id: 'egp', name: 'Egyptian Pound', labels: ['£', 'egp', '💰'] },
   jpy: { id: 'jpy', name: 'Japanese Yen', labels: ['¥', 'jpy', '💰'] },
  };

  const units = Object.values(unitMap)

  expect(getCommonLabels(units)).toEqual({
    '£': [unitMap.gbp, unitMap.egp],
    '💰': [unitMap.egp, unitMap.jpy],
  });
});

it('Returns an empty object if all labels are unique', () => {
  const units = [
    { id: 'usd', name: 'US dollar', labels: ['$', 'usd'] },
    { id: 'gbp', name: 'Pound Sterling', labels: ['£', 'gbp'] },
    { id: 'egp', name: 'Egyptian Pound', labels: ['💰'] },
  ];
  expect(getCommonLabels(units)).toEqual({});
});
