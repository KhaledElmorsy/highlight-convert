// Prepped setup for views that pick from different passed options

const options = {
  string: ['testA', 'testB', 'testC'],
  object: [
    { id: 'a', name: 'Integer-test', type: 'number' },
    { id: 'b', name: 'Float-test', type: 'number' },
    { id: 'c', name: 'String-test', type: 'string' },
  ],
};

export const picker = {
  string: {
    options: options.string,
    mapOptions: (options) => options.toUpperCase(),
  },
  object: {
    options: options.object,
    mapOptions: ({ id, name, type }) => ({
      title: name.toUpperCase(),
      subtitle: id.toUpperCase(),
    }),
    keys: { main: 'title', sub: 'subtitle' },
  },
};

export const comboBox = {
  string: {
    options: options.string,
    mapOptions: (options) => options.toUpperCase(),
  },
  object: {
    options: options.object,
    mapOptions: ({ id, name, type }) => ({
      title: name.toUpperCase(),
      subtitle: id.toUpperCase(),
      group: type.toUpperCase(),
    }),
    keys: { main: 'title', sub: 'subtitle', group: 'group' },
  },
};
