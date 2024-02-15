const GeneralSettingsLocator = {
  deploymentNameField: '[data-qa="name"]',
  descriptionField: '[data-qa="description"]',
  apiKeyField: '[data-qa="api_key"]',
  saveButton: '[data-qa="btn-save"]',
  cancelButton: '[data-qa="btn-cancel"]',
  apiKeyCopyButton: '[data-qa="api-key-copy"]',
  settingsBtn: '[data-qa="btn-settings"]',
  disableUserSignupCheckbox: '[data-qa="site-disable-registration"] input',
  modalTabs: '[role="tab"]',
  panelTitle: '[data-qa="panel-title"]',
  generalBtn: '[data-qa="btn-general"]',
  privateCheckbox: '[data-qa="site-private"]',
  privateCheckboxCheck: '[data-qa="site-private"] input',
  logoutBtn: '[data-qa="log-out"]',
  denialMsg: '[data-qa="denied"]',
  contactEmail: '[data-qa="contact-email"]',
  emailField: '[data-qa="email"]',
  generateAPIKey: '[data-qa="generate_api_key"]',
  acceptGenerateAPIKey: '[data-qa="btn-confirm-delete"]',
  queryLocation: '[data-qa="query-location"]',
  geocoderList: '[data-qa="geocoder-list"]',
  geocoderListItem: '[data-qa="geocoder-list-item"]',
  defaultLatitude: '[data-qa="default_latitude"]',
  defaultLongitude: '[data-qa="default_longitude"]'
};

export default GeneralSettingsLocator;
