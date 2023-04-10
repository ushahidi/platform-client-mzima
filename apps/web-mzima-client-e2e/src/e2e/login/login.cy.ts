import { Base, Login } from '../actions';

describe('Initialize login page', () => {
  before(() => {
    Base.goHomePage();
    Base.saveLocalStorage('USH_is_onboarding_done', 'true');
    Base.checkExistSelector('[data-qa="btn-auth"]');
    Base.clickElement('btn-auth');
  });

  it('Input login information', () => {
    Login.loginForm();
  });
  after(() => {
    cy.get('[data-qa="btn-auth"]').should('not.exist');
    cy.get('[data-qa="account-info"]').should('exist');
  });
});
