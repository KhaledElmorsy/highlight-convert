import dedent from '../dedent';

it('Dedents all lines in a multiline string', () => {
  const test = dedent`test
      hello world
  nice
    🤷‍♂️`;
  expect(test).toEqual('test\nhello world\nnice\n🤷‍♂️');
});

it('Interpolates strings and expressions', () => {
  const name = 'Khaled';
  const title = ': The One';
  const level = 99;
  const test = dedent`test
     ${name}${title} is 
  level ${level}. 
 I want to be more like him`;

  expect(test).toEqual(
    'test\nKhaled: The One is \nlevel 99. \nI want to be more like him'
  );
});

it('Handles only expressions', () => {
  const test = 'string';
  expect(dedent`${test}`).toEqual('string');
});

it('Doesnt dedent indented expressions', () => {
  const inner = `     ...outdent?`;
  expect(dedent`${inner}`).toEqual(inner);
});
