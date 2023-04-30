import Picker from '../Picker';
import storage from '@mocks/chrome/storage/storage'; // Mock chrome.storage
import setupCompletion from '@/settings/test-utils/setupCompletion';

const key = 'test';
const area = 'sync';
const defaultValue = { name: 'Khaled', settings: { darkMode: false } };
const options = [
  { name: 'Khaled', settings: { darkMode: false } },
  { name: 'Jeff', settings: { darkMode: true } },
  { name: 'Steve', settings: { darkMode: false } },
];
const defaultSetup = { area, key, defaultValue, options };

afterEach(jest.clearAllMocks);

describe('constructor():', () => {
  it('Throws if not passed an options array', () => {
    expect(() => new Picker(defaultSetup)).not.toThrow();
    expect(() => new Picker({ ...defaultSetup, options: undefined })).toThrow();
    expect(() => new Picker({ ...defaultSetup, options: 'fail' })).toThrow();
    expect(
      () => new Picker({ ...defaultSetup, options: { name: 'Khaled' } })
    ).toThrow();
  });

  it('Doesnt set a value if passed an invalid default value', async () => {
    new Picker({ ...defaultSetup, defaultValue: 'Nope' });
    await setupCompletion();
    expect(storage.sync.set).toHaveBeenCalledWith({
      [key]: { options, value: null },
    });
  });
});



describe('validate():', () => {
  it('Returns true if the value is in the options array, otherwise false', async () => {
    const picker = new Picker(defaultSetup);
    await setupCompletion();

    const tests = [
      {
        value: { name: 'Steve', settings: { darkMode: false } },
        expected: true,
      },
      {
        // Must serialize to the same value
        value: { settings: { darkMode: false }, name: 'Steve' }, // So property order matters
        expected: false,
      },
      { value: { name: 'Steve' }, expected: false },
      { value: null, expected: false },
      { value: 'Nope', expected: false },
    ];

    tests.forEach(({ value, expected }) => {
      expect(picker.validate(value)).toBe(expected);
    });

    const arrayPicker = new Picker({
      ...defaultSetup,
      options: [
        [1, 2, 3],
        [2, 2],
      ],
    });
    await setupCompletion();
    expect(arrayPicker.validate([2, 3, 1])).toBe(false); // Element order matters
  });
});
