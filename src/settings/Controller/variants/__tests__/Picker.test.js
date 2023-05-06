import Picker from '../Picker';
import setupCompletion from '@/settings/test-utils/setupCompletion';

const key = 'test';
const area = 'sync';
const options = [
  { name: 'Khaled', settings: { darkMode: false } },
  { name: 'Jeff', settings: { darkMode: true } },
  { name: 'Steve', settings: { darkMode: false } },
];
const defaultValue = options[0];
export const defaultSetup = { area, key, defaultValue, options };

afterEach(jest.clearAllMocks);

describe('constructor():', () => {
  it('Throws if the options argument is not an array', () => {
    expect(() => new Picker(defaultSetup)).not.toThrow();
    expect(() => new Picker({ ...defaultSetup, options: undefined })).toThrow();
    expect(() => new Picker({ ...defaultSetup, options: 'fail' })).toThrow();
    expect(
      () => new Picker({ ...defaultSetup, options: { name: 'Khaled' } })
    ).toThrow();
  });
});

describe('validate():', () => {
  it('Returns true if a value is in the options array', async () => {
    const picker = new Picker(defaultSetup);
    await setupCompletion();
    const tests = [
      [{ name: 'Jeff', settings: { darkMode: true } }, true],
      [{ settings: { darkMode: true }, name: 'Jeff' }, false], // Property order matters
      ['No', false],
    ];

    tests.forEach(([value, expected]) => {
      expect(picker.validate(value)).toBe(expected);
    });
  });
});

describe('get():', () => {
  it('Returns the selected option at the current index value', async () => {
    const picker = new Picker(defaultSetup);
    await setupCompletion();

    const value = options[1];
    chrome.storage.sync.get.mockResolvedValueOnce({ [key]: value });
    expect(await picker.get()).toBe(value);
  });
});
