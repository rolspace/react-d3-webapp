const prettierConfigStandard = require('prettier-config-standard')

const prettierConfig = Object.assign({}, prettierConfigStandard, {
  jsxBracketSameLine: true,
  trailingComma: 'es5',
})

module.exports = prettierConfig
