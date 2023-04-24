import mapKeys from '../mapKeys';

const path = 'test.path';
const map = mapKeys.new(path); // Test a specific path mapper

it('maps a singlular key string argument', () => {
  const key = 'item';
  expect(mapKeys(key, path)).toBe(`${path}.${key}`);
  expect(map(key)).toBe(`${path}.${key}`);
});

it('maps an array of keys', () => {
  const keys = ['item1', 'item2'];
  const mappedKeys = keys.map((key) => `${path}.${key}`);
  expect(mapKeys(keys, path)).toEqual(mappedKeys);
  expect(map(keys)).toEqual(mappedKeys);
});

it('maps the outer level of an object of items', () => {
  const items = {
    settings: {
      darkMode: true,
      showOnline: true,
    },
    data: {
      name: 'Khaled',
    },
  };

  const mappedItems = {
    [`${path}.settings`]: {
      darkMode: true,
      showOnline: true,
    },
    [`${path}.data`]: {
      name: 'Khaled',
    },
  }

  expect(mapKeys(items, path)).toEqual(mappedItems);
  expect(map(items)).toEqual(mappedItems);
});
