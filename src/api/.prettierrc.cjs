const prettierConfigStandard = require('prettier-config-standard')

const prettierConfig = Object.assign({}, prettierConfigStandard, {
  bracketSameLine: true,
  trailingComma: 'all',
})

module.exports = prettierConfig
