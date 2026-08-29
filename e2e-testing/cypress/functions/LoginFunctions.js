import LoginLocators from '../locators/LoginLocators';

class LoginFunctions {
  launch_login_modal(launchURL) {
    cy.visit(launchURL);
    cy.wait(3000);
    cy.get('body').then(($body) => {
      if ($body.find('#onboarding-button-greeting').length > 0) {
        cy.get('#onboarding-button-greeting', { timeout: 10000 }).click({ force: true });
        cy.wait(1000);
      }
    });
    cy.get('body').then(($body) => {
      if ($body.find(LoginLocators.declineCookiesBtn).length > 0) {
        cy.get(LoginLocators.declineCookiesBtn).click({ force: true });
        cy.wait(500);
      }
    });
    cy.get(LoginLocators.loginModal, { timeout: 15000 }).click({ force: true });
  }

  type_email(email) {
    cy.wait(1000);
    cy.get(LoginLocators.emailField).type(email, { force: true }).should('have.value', email);
  }

  type_password(password) {
    cy.get(LoginLocators.passwordField)
      .clear({ force: true })
      .type(password, { force: true })
      .invoke('val')
      .should('have.length.gte', 1);
  }

  click_login_button() {
    cy.get(LoginLocators.loginButton).click();
  }

  check_user_details_correct() {
    const name = Cypress.env('ush_admin_name');
    const email = Cypress.env('ush_admin_email');
    cy.viewport(1440, 900);
    cy.get(LoginLocators.userName).contains(name);
    cy.get(LoginLocators.userEmail).contains(email);
  }

  //quick-fix, change language to english after logging in
  change_language() {
    cy.get('body').then(($body) => {
      if ($body.find('.language__selected').length > 0) {
        cy.get('.language__selected').click();
        cy.get('#mat-option-7 > .mat-option-text').click();
      }
    });
  }

  click_through_onboarding() {
    cy.wait(2000);
    cy.get('body').then(($body) => {
      if ($body.find('#onboarding-button-greeting').length > 0) {
        cy.get('#onboarding-button-greeting').click({ force: true });
      }
    });
    cy.get('body').then(($body) => {
      if ($body.find(LoginLocators.declineCookiesBtn).length > 0) {
        cy.get(LoginLocators.declineCookiesBtn).click({ force: true });
      }
    });
  }

  verify_invalid_email_error_exist() {
    cy.get(LoginLocators.emailField).blur();
    cy.get(LoginLocators.invalidEmail).should('be.visible');
  }

  verify_invalid_credentials_error_exist() {
    cy.get(LoginLocators.invalidCredentials).should('be.visible');
  }

  verify_login() {
    cy.get(LoginLocators.loginButton).should('not.exist');
    cy.get(LoginLocators.accountBtn).should('exist');
  }

  verify_negative_login() {
    this.launch_login_modal(Cypress.env('baseUrl'));
    this.type_email('test');
    this.verify_invalid_email_error_exist();
    cy.get(LoginLocators.emailField).type('@gmail.com');
    this.type_password('Password@@@2023');
    this.click_login_button();
    this.verify_invalid_credentials_error_exist();
  }

  logout() {
    cy.get(LoginLocators.accountInfoBtn).click();
    cy.get(LoginLocators.logOutBtn).click();
    cy.reload();
  }

  login_as_admin() {
    cy.session(
      [Cypress.env('ush_admin_email'), Cypress.env('ush_admin_pwd')],
      () => {
        this.launch_login_modal(Cypress.env('baseUrl'));
        this.type_email(Cypress.env('ush_admin_email'));
        this.type_password(Cypress.env('ush_admin_pwd'));
        this.click_login_button();
        this.verify_login();
        this.check_user_details_correct();
      },
      { cacheAcrossSpecs: true },
    );
  }

  login_member_user() {
    cy.session(
      [Cypress.env('ush_user_email'), Cypress.env('ush_user_pwd')],
      () => {
        this.launch_login_modal(Cypress.env('baseUrl'));
        this.type_email(Cypress.env('ush_user_email'));
        this.type_password(Cypress.env('ush_user_pwd'));
        this.click_login_button();
        this.verify_login();
      },
      { cacheAcrossSpecs: true },
    );
  }
}

export default LoginFunctions;
