/**
 * Dedent multiline template literals
 * @param {string[]} strings 
 * @param  {...any} exps 
 * @returns 
 */
export default function dedent(strings, ...exps) {
  return strings
    .flatMap((s, i) => [
      s.replaceAll(/(?<=\n)\s+/g, ''),
      ...(exps[i] !== undefined ? [exps[i]] : []),
    ])
    .join('');
}
