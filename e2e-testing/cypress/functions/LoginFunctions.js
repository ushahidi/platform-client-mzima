import LoginLocators from "../locators/LoginLocators";

class LoginFunctions {
  launch_login_modal(launchURL) {
    cy.visit(launchURL);
    this.click_through_onboarding();
    cy.get(LoginLocators.loginModal).click();
  }

  type_email(email) {
    cy.wait(1000);
    cy.get(LoginLocators.emailField).type(email);
  }

  type_password(password) {
    cy.get(LoginLocators.passwordField).type(password);
  }

  click_login_button() {
    cy.get(LoginLocators.loginButton).click();
  }

  click_through_onboarding() {
    cy.get("#onboarding-button-greeting").click();
    cy.get("#onboarding-button-marker").click();
    cy.get("#onboarding-button-filters").click();
    cy.get("#onboarding-button-sorting").click();
    cy.get("#onboarding-button-activity").click();
    cy.get("#onboarding-button-collections").click();
    cy.get("#onboarding-button-clapper").click();
    cy.get('[data-qa="button-decline-cookies"]').click();
  }

  login_as_admin() {
    this.launch_login_modal(Cypress.env("baseUrl"));
    this.type_email(Cypress.env("ush_admin_email"));
    this.type_password(Cypress.env("ush_admin_pwd"));
    this.click_login_button();
  }
}

export default LoginFunctions;
