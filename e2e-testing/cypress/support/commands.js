//@ts-check
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import LoginLocators from '../locators/LoginLocators';
import * as settingsRoleLocators from '../locators/settings-roles-locators';
import { loginSignupMenu } from '../locators/sidenav-locators';

/**
 * Login to the app via the login modal
 *
 * @param {object} [credentials] - The credentials to use for login
 * @param {string} [credentials.email] - The email to use for login
 * @param {string} [credentials.password] - The password to use for login
 * @param {boolean} [credentials.skipOnboarding] - skips onboarding if true
 * @param {string} [credentials.cookieConsent] - skips onboarding if true
 * @returns {void}
 *
 */
const login = ({
  email = Cypress.env('ush_admin_email'),
  password = Cypress.env('ush_admin_pwd'),
  skipOnboarding = true,
  cookieConsent = 'true',
} = {}) => {
  if (skipOnboarding) localStorage.setItem('USH_is_onboarding_done', 'true');
  cy.setCookie('CookieAccepted', cookieConsent);
  cy.visit('/');
  cy.contains(loginSignupMenu).click();
  cy.get(LoginLocators.emailField).type(email);
  cy.get(LoginLocators.passwordField).type(password);
  cy.get(LoginLocators.loginButton).click();
};

/**
 * Add a role via the settings page
 *
 * @param {object} role - The role to add
 * @param {string} role.name - The name of the role
 * @param {string} role.description - The description of the role
 * @param {Array<string>} role.permissions - A list of permissions for the role
 * @param {boolean} [save=true] - Whether to save the role or not
 * @returns {void}
 *
 */
const addRole = ({ name, description, permissions }, save = true) => {
  cy.visit('/settings/roles');
  cy.get(settingsRoleLocators.addRoleButton).click();
  cy.get(settingsRoleLocators.roleItemHeader).should('contain', 'Add Role');
  cy.get(settingsRoleLocators.roleNameInput).type(name);
  if (description) cy.get(settingsRoleLocators.roleDescriptionInput).type('Test Role Description');
  for (const permission of permissions) {
    cy.get(settingsRoleLocators.rolesPermissionsCheckboxes[permission])
      .click()
      .should('have.attr', 'aria-selected', 'true');
  }

  if (save)
    cy.get(settingsRoleLocators.saveRoleButton)
      .find('button')
      .should('be.enabled')
      .and('contain.text', 'Save & close')
      .click();
};

Cypress.Commands.addAll({ login, addRole });
