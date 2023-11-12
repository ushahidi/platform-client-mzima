import SettingsLocators from '../locators/SettingsLocators';
import LoginLocators from '../locators/LoginLocators';

class SettingsFunctions {
  open_general_settings_page() {
    cy.get(SettingsLocators.stngsBtn).click();
    cy.get(SettingsLocators.generalStnsBtn).click();
  }

  logout() {
    cy.get(SettingsLocators.accountInfoBtn).click();
    cy.get(SettingsLocators.logOutBtn).click();
    cy.reload();
  }

  verify_signup_is_disabled() {
    cy.get(LoginLocators.loginModal).click();
    cy.get(SettingsLocators.modalTabs).eq(1).should('not.exist')
  }

  disable_signup_and_verify() {
    cy.get(SettingsLocators.disableUserSignupCheckbox).then((checkbox) => {
      const isChecked = checkbox.attr('aria-checked');

      if (isChecked === 'true') {
        this.logout();
        this.verify_signup_is_disabled();
      } else {
        cy.get(SettingsLocators.disableUserSignupCheckbox).click();
        cy.get(SettingsLocators.saveBtn).click();
        this.logout();
        this.verify_signup_is_disabled();
      }
    });
  }
}

export default SettingsFunctions;
