import Setting from './Setting';
import Controller from './Controller/Controller';

jest.mock('./Controller/Controller');

const setting = new Setting({
  name: 'test',
  controller: new Controller(),
  onChange: jest.fn(),
});

describe('set():', () => {
  it('Invokes setting items setter with value and calls onChange handler', async () => {
    const newValue = {};
    await setting.set(newValue);
    expect(setting.controller.set).toHaveBeenCalledWith(newValue);
    expect(setting.onChange).toHaveBeenCalledWith(newValue);
  });
});

describe('get():', () => {
  it('returns the stored setting value', async () => {
    const value = {};
    Controller.prototype.get.mockResolvedValueOnce(value);
    expect(await setting.get()).toBe(value);
  });
});
