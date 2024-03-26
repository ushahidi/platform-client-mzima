import { Base, Login, Settings } from '../actions';
import 'cypress-axe'

describe('Initialize surveys page', () => {
  before(() => {
    Base.goHomePage();
    Base.saveLocalStorage('USH_is_onboarding_done', 'true');
    cy.get('app-cookies-notification').should('exist');
    cy.get(`[data-qa="button-decline-cookies"]`).contains('Decline').click();
    Login.loginForm();
  });

  it('Settings page exists', () => {
    Settings.checkSettingsPage();
    // Perform accessibility checks
    cy.injectAxe();
    cy.checkA11y();
  });
});
