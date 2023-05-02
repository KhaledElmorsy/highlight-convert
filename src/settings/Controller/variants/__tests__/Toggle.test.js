import Toggle from '../Toggle';
import storage from '@mocks/chrome/storage/storage';
import setupCompletion from '@/settings/test-utils/setupCompletion';

const key = 'test';
const area = 'sync';
const defaultSetup = { key, area };

describe('constructor():', () => {
  it('Sets default value if passed', async () => {
    new Toggle({ ...defaultSetup, defaultValue: false });
    await setupCompletion();
    expect(storage.sync.set).toHaveBeenCalledWith({ [key]: false });
  });

  it('Sets value to "true" by default if one isnt passed', async () => {
    new Toggle(defaultSetup);
    await setupCompletion();
    expect(storage.sync.set).toHaveBeenCalledWith({ [key]: true });
  });
});

describe('validate():', () => {
  it('Validates if the value is a boolean', async () => {
    const toggle = new Toggle(defaultSetup);
    await setupCompletion();
    const tests = [
      { group: 'valid', values: [false, true], expected: true },
      { group: 'invalid', values: [[], {}, 'asd', 2, null], expected: false },
    ];
    tests.forEach(({ values, expected }) => {
      values.forEach((value) => expect(toggle.validate(value)).toBe(expected));
    });
  });
});

describe('toggle():', () => {
  it('Toggles the value', async () => {
    const toggle = new Toggle(defaultSetup);
    await setupCompletion();

    for (let initialVal of [true, false]) {
      storage.sync.get.mockReturnValueOnce({ [key]: initialVal });
      await toggle.toggle();
      expect(storage.sync.set).toHaveBeenCalledWith({
        [key]: !initialVal,
      });
    }
  });
});
