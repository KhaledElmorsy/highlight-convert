import Controller from './Controller';
import storage from '@mocks/chrome/storage/storage';
import setupCompletion from '../test-utils/setupCompletion';

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
  it('Sets value to default if no storage item exists', async () => {
    storage.sync.get.mockReturnValueOnce({});
    new Controller(defaultSetup);
    await setupCompletion();
    expect(storage.sync.set).toHaveBeenCalledWith({
      [key]: defaultValue,
    });
  });

  it('Updates stored value if its not a valid option', async () => {
    const validateSpy = jest
      .spyOn(Controller.prototype, 'validate')
      .mockImplementation((val) => val === defaultValue);

    new Controller(defaultSetup);
    await setupCompletion();
    expect(storage.sync.set).toHaveBeenCalledWith({
      [key]: defaultValue,
    });
    validateSpy.mockRestore();
  });
});

describe('get():', () => {
  it('Returns the current setting', async () => {
    storage.sync.get.mockReturnValue({ [key]: defaultValue  });
    const controller = new Controller(defaultSetup);
    await setupCompletion();
    const value = await controller.get();
    expect(value).toBe(defaultValue);
    storage.sync.get.mockReset();
  });
});

describe('set():', () => {
  it('Replaces the current setting value when passed:', async () => {
    const controller = new Controller(defaultSetup);
    await setupCompletion();
    await controller.set(options[1]);
    expect(storage.sync.set).toHaveBeenCalledWith({
      [key]: options[1]
    })
  });

  it('Throws if attempting to set an invalid value', async () => {
    const controller = new Controller(defaultSetup);
    await setupCompletion();
    jest.spyOn(Controller.prototype, 'validate').mockReturnValueOnce(false);
    await expect(controller.set('test')).rejects.toThrow();
  });
});
