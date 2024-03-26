import testData from '../../../fixtures/test-data.fixture';
import { Base, Login, Settings } from '../../actions';
import 'cypress-axe'

describe('Initialize role page', () => {
  before(() => {
    Base.goHomePage();
    localStorage.setItem('USH_is_onboarding_done', 'true');
    cy.get('app-cookies-notification').should('exist');
    cy.get(`[data-qa="button-decline-cookies"]`).contains('Decline').click();
    Login.loginForm();
    Settings.checkSettingsPage();
  });

  it('Roles page exists', () => {
    Base.checkExistSelector('[data-qa="btn-roles"]');
    Base.clickElement('btn-roles');
    Base.checkExistSelector('app-roles');

    // Perform accessibility checks
    cy.injectAxe();
    cy.checkA11y();
  });

  it('Create role', () => {
    Base.checkExistSelector('[data-qa="btn-add-role"]');
    Base.clickElement('btn-add-role');
    Base.checkExistSelector('app-role-item');

    cy.get('form').within(() => {
      Base.inputField('display_name', testData.roleData.name);
      Base.inputField('description', testData.roleData.description);
      Base.checkField('manage-posts');
      Base.checkContainElement('btn-save-role', 'Save & close');
      Base.submitButton();
    });

    // Perform accessibility checks
    cy.injectAxe();
    cy.checkA11y();
  });
});
