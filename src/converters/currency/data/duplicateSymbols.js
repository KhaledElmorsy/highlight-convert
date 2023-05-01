/**
 * A map of symbols and the ID's of the currencies that share them.
 * 
 * Created with `./scripts/dupliacteSymbols.js`
 * 
 * Order manually adjusted for default options.
 * 
 * @type {{[symbol: string]: Unit['id'][]}}
 */
export default  {
  $: [
    'usd',
    'ars',
    'aud',
    'bsd',
    'bbd',
    'bmd',
    'bnd',
    'cad',
    'kyd',
    'clp',
    'cop',
    'xcd',
    'svc',
    'fjd',
    'gyd',
    'hkd',
    'lrd',
    'mxn',
    'nad',
    'nzd',
    'sgd',
    'sbd',
    'srd',
  ],
  ƒ: ['awg', 'ang'],
  лв: ['bgn', 'kzt', 'kgs', 'uzs'],
  '¥': ['jpy','cny'],
  '₱': ['php','cup'],
  kr: ['dkk', 'isk', 'nok', 'sek'],
  '£': ['gbp','egp', 'fkp', 'gip', 'ggp', 'imp', 'jep', 'lbp', 'shp', 'syp'],
  '﷼': ['sar','irr', 'omr', 'qar' , 'yer'],
  '₩': ['krw','kpw'],
  '₨': ['mur', 'npr', 'pkr', 'scr', 'lkr'],
};
