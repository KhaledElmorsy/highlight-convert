import Setting from './Setting';
import storage from '@mocks/chrome/storage/storage';
import setupCompletion from './test-utils/setupCompletion';

const area = 'sync';
const key = 'test.setting';
const defaultValue = { name: 'Khaled', level: 320 };
const options = [
  { name: 'Khaled', level: 320 },
  { name: 'Jeff', level: 155 },
  { name: 'Steve', level: 299 },
];
const defaultSetup = { area, key, defaultValue, options };

afterEach(jest.clearAllMocks);

describe('constructor():', () => {
  it('Stores options and default value in storage if not previously set', async () => {
    storage.sync.get.mockReturnValueOnce({});
    new Setting(defaultSetup);
    await setupCompletion();
    expect(storage.sync.set).toHaveBeenCalledWith({
      [key]: {
        options,
        value: defaultValue,
      },
    });
  });

  describe('Stored item exists:', () => {
    it('Doesnt update items if the passed options match stored ones', async () => {
      storage.sync.get.mockReturnValueOnce({ [key]: { options } });
      new Setting(defaultSetup);
      await setupCompletion();
      expect(storage.sync.set).not.toHaveBeenCalled();
    });
  });

  describe('Passed options dont match stored:', () => {
    // Old items, different from passed options.
    const storedItem = {
      [key]: {
        options: [{ name: 'Khaled' }, { name: 'Steve' }, { name: 'Jeff' }],
        value: { name: 'Khaled' },
      },
    };

    beforeEach(() => {
      storage.sync.get.mockReturnValueOnce(storedItem);
    });

    it('Updates stored options', async () => {
      new Setting(defaultSetup);
      await setupCompletion();
      expect(storage.sync.set).toHaveBeenCalledWith({
        [key]: expect.objectContaining({
          options,
        }),
      });
    });

    it('Updates stored value if its not a valid option', async () => {
      const validateSpy = jest
        .spyOn(Setting.prototype, 'validate')
        .mockImplementation((val) => val === defaultValue);

      new Setting(defaultSetup);
      await setupCompletion();
      expect(storage.sync.set).toHaveBeenCalledWith({
        [key]: expect.objectContaining({
          value: defaultValue,
        }),
      });
      validateSpy.mockRestore();
    });

    it('Keeps the stored value if its valid', async () => {
      jest.spyOn(Setting.prototype, 'validate').mockReturnValue(true);
      new Setting(defaultSetup);
      await setupCompletion();
      expect(storage.sync.set).toHaveBeenCalledWith({
        [key]: expect.objectContaining({
          value: storedItem[key].value,
        }),
      });
    });
  });
});

describe('get():', () => {
  it('Returns the current setting', async () => {
    storage.sync.get.mockReturnValue({ [key]: { value: defaultValue } });
    const setting = new Setting(defaultSetup);
    await setupCompletion();
    const value = await setting.get();
    expect(value).toBe(defaultValue);
    storage.sync.get.mockReset();
  });
});

describe('set():', () => {
  describe('Replaces the current setting value when passed:', () => {
    const setting = new Setting(defaultSetup);
    let value;

    afterEach(async () => {
      // Test against different current value types to ensure values are never merged.
      const currentValues = [{ name: 'Jeff' }, [1, 2, 3], 'Test'];

      for (let currentValue of currentValues) {
        storage.sync.get.mockReturnValue({ [key]: { value: currentValue } });

        await setting.set(value);
        expect(storage.sync.set).toHaveBeenCalledWith({
          [key]: expect.objectContaining({ value }),
        });

        jest.resetAllMocks();
      }
    });

    test('primitives', () => {
      value = 'Khaled';
    });
    test('arrays', () => {
      value = [1];
    });
    test('objects', () => {
      value = { name: 'Khaled' };
    });
  });

  it('Throws if attempting to set an invalid value', async () => {
    const setting = new Setting(defaultSetup);
    await setupCompletion();
    jest.spyOn(Setting.prototype, 'validate').mockReturnValueOnce(false);
    await expect(setting.set('test')).rejects.toThrow();
  });
});
