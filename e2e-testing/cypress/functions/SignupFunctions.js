import SignupLocators from '../locators/SignupLocators';
import LoginFunctions from './LoginFunctions';

const loginFunctions = new LoginFunctions();

class SignupFunctions {
  constructor() {
    this.uniqueName = `Cypress User${Math.floor(Math.random() * 900) + 100}`;
    this.uniqueEmail = `cypress.${Math.floor(Math.random() * 900) + 100}@xyz.com`;
  }
  type_name(name) {
    cy.wait(1000);
    cy.get(SignupLocators.nameField).type(name).should('have.value', name);
  }

  verify_signed_user() {
    cy.get(SignupLocators.accountInfoBtn).click();
    cy.get(SignupLocators.accountStnsBtn).click();
    cy.get(SignupLocators.displayNameField).should('have.value', this.uniqueName);
    cy.get(SignupLocators.emailField).should('have.value', this.uniqueEmail);
    cy.get(SignupLocators.closeDialogBtn).click();
  }

  fill_all_fields() {
    this.type_name(this.uniqueName);
    loginFunctions.type_email(this.uniqueEmail);
    loginFunctions.type_password('Password@Cypress2023');
    cy.get(SignupLocators.agreeToTerms).click({ force: true });
  }

  verify_privacy_and_terms_link() {
    cy.get(SignupLocators.termsLink)
      .eq(0)
      .should('have.attr', 'href', 'https://www.ushahidi.com/privacy-policy');
    cy.get(SignupLocators.termsLink)
      .eq(1)
      .should('have.attr', 'href', 'https://www.ushahidi.com/terms-of-service');
  }

  signup() {
    loginFunctions.launch_login_modal(Cypress.env('baseUrl'));
    cy.wait(1000);
    cy.get(SignupLocators.signupTab).eq(1).click();
    this.fill_all_fields();
    cy.get(SignupLocators.signupBtn).should('be.enabled');
    cy.get(SignupLocators.nameField).clear();
    cy.get(SignupLocators.signupBtn).should('be.disabled');
    cy.get(SignupLocators.emailField).type('{backspace}{backspace}{backspace}');
    cy.get(SignupLocators.emailField).blur();
    cy.get(SignupLocators.invalidEmailError).should('be.visible');
    cy.get(SignupLocators.signupBtn).should('be.disabled');
    this.type_name(this.uniqueName);
    cy.get(SignupLocators.emailField).type('com');
    cy.get(SignupLocators.signupBtn).should('be.enabled');
    this.verify_privacy_and_terms_link();
    cy.get(SignupLocators.signupBtn).click();
  }
}

export default SignupFunctions;
