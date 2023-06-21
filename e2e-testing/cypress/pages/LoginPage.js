import LoginLocators from '../locators/LoginLocators';

class LoginPage {
  launch_login_modal(skipOnboarding = true) {
    if (skipOnboarding) window.localStorage.setItem('USH_is_onboarding_done', 'true');
    cy.visit('/');
    if (skipOnboarding) this.completeOnboarding();
    cy.get(LoginLocators.loginModal).click();
  }

  type_email(email) {
    cy.wait(1000);
    cy.get(LoginLocators.emailField).type(email).should('have.value', email);
  }

  type_password(password) {
    cy.get(LoginLocators.passwordField)
      .clear()
      .type(password)
      .invoke('val')
      .should('have.length', 12);
  }

  click_login_button() {
    cy.get(LoginLocators.loginButton).click();
  }

  completeOnboarding() {
    cy.get('#onboarding-button-greeting').click();
    cy.get('#onboarding-button-marker').click();
    cy.get('#onboarding-button-filters').click();
    cy.get('#onboarding-button-sorting').click();
    cy.get('#onboarding-button-activity').click();
    cy.get('#onboarding-button-collections').click();
    cy.get('#onboarding-button-clapper').click();
    cy.get('[data-qa="button-decline-cookies"]').click();
  }

  verify_login() {
    cy.get(LoginLocators.loginButton).should('not.exist');
    cy.get(LoginLocators.accountBtn).should('exist');
  }

  login_as_admin(skipOnboarding = true) {
    this.launch_login_modal();
    this.type_email(Cypress.env('ush_admin_email'));
    this.type_password(Cypress.env('ush_admin_pwd'));
    this.click_login_button();
    this.verify_login();
  }
}

export default LoginPage;
