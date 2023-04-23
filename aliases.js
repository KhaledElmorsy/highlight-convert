const path = require('path');
const {compilerOptions: {paths}} = require('./jsconfig.json')

const toolMappers = {
  webpack: {
    alias: (str) => str.match(/.*(?=\/\*)/)[0],
    dir: (str) => path.resolve(__dirname, str.match(/.*(?=\*)/)[0])
  },
  jest: {
    alias: (str) => '^' + str.replace(/\*$/, '(.*)$'),
    dir: (str) => '<rootDir>' + str.replace(/\*$/, '$1')
  }
}

/** 
 * Map aliases for a specific tool
 * @param {keyof toolMappers} tool
 */
function mapAlias(tool) {
  const {alias: mapAlias, dir: mapDir} = toolMappers[tool];
  const mappedEntries = Object.entries(paths).map(([alias, dirs]) => [
    mapAlias(alias),
    dirs.map(mapDir)
  ])
  return Object.fromEntries(mappedEntries)
}

module.exports.webpack = mapAlias('webpack');
module.exports.jest = mapAlias('jest');
