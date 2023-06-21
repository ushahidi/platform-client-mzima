if (!('cypressPluginConfig' in window.top)) {
  window.top.cypressPluginConfig = {}
}

function getPluginConfigValue(key) {
  if (typeof key !== 'string') {
    throw new Error('Expected a config string key')
  }
  return Cypress._.get(window.top.cypressPluginConfig, key, Cypress.env(key))
}

function setPluginConfigValue(key, value) {
  window.top.cypressPluginConfig[key] = value
}

/** Returns all config values as an object*/
function getPluginConfigValues() {
  return window.top.cypressPluginConfig
}

function removePluginConfigValue(key) {
  if (typeof key !== 'string') {
    throw new Error('Expected a config string key')
  }
  delete window.top.cypressPluginConfig[key]
}

if (!Cypress.setPluginConfigValue) {
  Cypress.setPluginConfigValue = setPluginConfigValue
  Cypress.getPluginConfigValue = getPluginConfigValue
  Cypress.getPluginConfigValues = getPluginConfigValues
  Cypress.removePluginConfigValue = removePluginConfigValue
}

module.exports = {
  getPluginConfigValue,
  setPluginConfigValue,
  getPluginConfigValues,
  removePluginConfigValue,
}
