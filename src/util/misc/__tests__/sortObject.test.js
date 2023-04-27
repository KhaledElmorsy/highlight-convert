import sortObject from '../sortObject';

const input = {
  user: {
    name: 'Khaled',
    age: 29,
    userSettings: {
      showEmail: false,
      appearAway: false,
    },
    friends: [
      { name: 'Jeff', age: 29 },
      { name: 'Bob', age: 29 },
    ],
  },
  settings: {
    darkMode: true,
    bookmarkBar: null, // typeof null === 'object' 🤷‍♂️
  },
};

it('Sorts nested objects without touching arrays', () => {
  expect(sortObject(input)).toEqual({
    settings: {
      bookmarkBar: null,
      darkMode: true,
    },
    user: {
      age: 29,
      friends: [
        { name: 'Jeff', age: 29 },
        { name: 'Bob', age: 29 },
      ],
      name: 'Khaled',
      userSettings: {
        appearAway: false,
        showEmail: false,
      },
    },
  });
});

it('Can sort keys in descending order', () => {
  expect(sortObject(input, false)).toEqual({
    user: {
      userSettings: {
        showEmail: false,
        appearAway: false,
      },
      name: 'Khaled',
      friends: [
        { name: 'Jeff', age: 29 },
        { name: 'Bob', age: 29 },
      ],
      age: 29,
    },
    settings: {
      darkMode: true,
      bookmarkBar: null,
    },
  })
})
