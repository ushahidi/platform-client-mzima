import GeneralSettingsLocator from '../locators/GeneralSettingsLocator';

class ChangeContactEmailAddressFunctions {
  open_general_settings() {
    cy.get(GeneralSettingsLocator.settingsBtn).click();
  }
  change_contact_email_address() {
    cy.get(GeneralSettingsLocator.emailField).should('not.be.empty');
    cy.get(GeneralSettingsLocator.emailField).clear().type('testnew@gmail.com');
  }

  click_save_button() {
    cy.get(GeneralSettingsLocator.saveButton).click();
  }

  check_new_contact_email_address_shows() {
    cy.get(GeneralSettingsLocator.contactEmail).contains('testnew@gmail.com');
  }
}

export default ChangeContactEmailAddressFunctions;
