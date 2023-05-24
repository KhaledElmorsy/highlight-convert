import createDomain, { registeredIDs } from './createDomain';
import createConverter from '@converters/createConverter/createConverter';
import { createRenderSettings } from '@render/views/conversion/util';
import Domain from './Domain';

jest.mock('@converters/createConverter/createConverter');
jest.mock('@render/views/conversion/util/createRenderSettings');
jest.mock('./Domain');

const units = [];
const id = 'test';

const converter = {
  convert: jest.fn(() => {}),
  match: jest.fn(() => {}),
};
const converterControllers = {};

createConverter.mockReturnValue({
  converter,
  controllers: converterControllers,
});

const getRenderSettings = {};
const renderControllers = {};
createRenderSettings.mockReturnValue({
  getRenderSettings,
  controllers: renderControllers,
});

const converterConfig = { test: {} };
const renderConfig = { test: {} };

/** @typedef {ReturnType<createDomain<Unit>>} DomainFactoryReturn */

/** @type {DomainFactoryReturn['domain']}  */
let domain;

/** @type {DomainFactoryReturn['controllers']} */
let controllers;

const setup = () => {
  jest.clearAllMocks();
  ({ domain, controllers } = createDomain({
    id,
    units,
    converterConfig,
    renderConfig,
  }));
};

beforeEach(() => {
  registeredIDs.clear();
  setup();
});

it('Returns a domain object', () => {
  expect(domain).toBeInstanceOf(Domain);
});

it('Throws if invoked with the same ID more than once', () => {
  expect(setup).toThrow();
});

describe('Converter', () => {
  it('Passes a mapped ID to the converter factory', () => {
    expect(createConverter).toHaveBeenCalledWith(
      expect.objectContaining({
        id: `${id}.converter`,
      })
    );
  });

  it('Passes the units to the converter factory', () => {
    expect(createConverter.mock.calls[0][0].units).toBe(units);
  });

  it('Passes converter configuration to the relevant factory', () => {
    expect(createConverter).toHaveBeenCalledWith(
      expect.objectContaining({ ...converterConfig })
    );
    for (let key in converterConfig) {
      expect(createConverter.mock.calls[0][0][key]).toBe(converterConfig[key]);
    }
  });

  it('Returns the controllers created by the factory', () => {
    expect(controllers.converter).toBe(converterControllers);
  });

  it('Intializes the domain object with the converters convert() and match() methods', () => {
    const { convert, match } = Domain.mock.calls[0][0];
    jest.clearAllMocks();

    convert();
    expect(converter.convert).toHaveBeenCalled();
    expect(converter.convert.mock.instances[0]).toBe(converter);

    match();
    expect(converter.match).toHaveBeenCalled();
    expect(converter.match.mock.instances[0]).toBe(converter);
  });
});

describe('Render Settings', () => {
  it('Passes a mapped ID to the render settings factory', () => {
    expect(createRenderSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        id: `${id}.renderSettings`,
      })
    );
  });

  it('Passes the units to the render settings factory', () => {
    expect(createRenderSettings.mock.calls[0][0].units).toBe(units);
  });

  it('Passes the render config to the factory', () => {
    expect(createRenderSettings).toHaveBeenCalledWith(
      expect.objectContaining({ ...renderConfig })
    );

    for (let key in renderConfig) {
      expect(createRenderSettings.mock.calls[0][0][key]).toBe(
        renderConfig[key]
      );
    }
  });

  it('Returns the generated render settings controllers', () => {
    expect(controllers.render).toBe(renderControllers);
  });

  it('Initializes the domain with the returned render settings getter', () => {
    expect(Domain.mock.calls[0][0].getRenderSettings).toBe(getRenderSettings);
  });
});
