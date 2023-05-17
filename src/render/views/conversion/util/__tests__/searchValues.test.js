import searchValues from '../searchValues';

const units = [
  { id: 'eur', name: 'Euro' },
  { id: 'gbp', name: 'Pound sterling' },
  { id: 'EGP', name: 'Egyptian pound' },
  { id: 'USD', name: 'US Dollar' },
];

const idMap = units.reduce(function (acc, { id }) {
  return { ...acc, [id]: { unit: { id } } };
}, {});

const idValues = Object.values(idMap);

const fullMap = units.reduce(function (acc, { id, name }) {
  return {
    ...acc,
    [id]: { unit: { name, id } },
  };
}, {});

const fullValues = Object.values(fullMap);

describe('Filtering', () => {
  it('Filters out values if their IDs dont include the query', () => {
    expect(searchValues(idValues, 'uS')).toEqual([idMap.USD]);
    expect(searchValues(idValues, 'U')).toEqual(
      expect.arrayContaining([idMap.USD, idMap.eur])
    );
    expect(searchValues(idValues, 'p')).toEqual(
      expect.arrayContaining([idMap.gbp, idMap.EGP])
    );
  });

  it('Filters out values if neither ID not name contain the query', () => {
    expect(searchValues(fullValues, 'D')).toEqual(
      expect.arrayContaining([fullMap.USD, fullMap.gbp, fullMap.EGP])
    );
  });
});

describe('Sorting - Moves values that include the query to the start', () => {
  test('Values with only IDs', () => {
    expect(searchValues(idValues, 'u')).toEqual([idMap.USD, idMap.eur]);
  });

  test('Values with names and IDs', () => {
    expect(searchValues(fullValues, 'p')).toEqual([
      fullMap.gbp,
      fullMap.EGP,
    ]);
  });
});
