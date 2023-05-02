import Picker from '../Picker';
import storage from '@mocks/chrome/storage/storage'; // Mock chrome.storage
import setupCompletion from '@/settings/test-utils/setupCompletion';

const key = 'test';
const area = 'sync';
const defaultValue = 0;
const options = [
  { name: 'Khaled', settings: { darkMode: false } },
  { name: 'Jeff', settings: { darkMode: true } },
  { name: 'Steve', settings: { darkMode: false } },
];
const defaultSetup = { area, key, defaultValue, options };

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
  it('Returns true only when the value (index) is within the options array range', () => {
    const picker = new Picker(defaultSetup);
    const length = options.length;
    const tests = [
      [0, true],
      [-1, false],
      [length - 1, true],
      [length, false],
    ];

    tests.forEach(([value, expected]) => {
      expect(picker.validate(value)).toBe(expected);
    });
  });
});

describe('getters:', () => {
  const index = 1;
  let picker;

  beforeAll(() => {
    storage.sync.get.mockResolvedValue({ [key]: index });
    picker = new Picker(defaultSetup);
  });

  describe('get():', () => {
    it('Returns the selected option at the current index value', async () => {
      expect(await picker.get()).toBe(options[index]);
    });
  });

  describe('getIndex():', () => {
    it('Returns the current index value', async () => {
      expect(await picker.getIndex()).toBe(index);
    });

    afterAll(() => {
      storage.sync.get.mockReset();
    });
  });
});
