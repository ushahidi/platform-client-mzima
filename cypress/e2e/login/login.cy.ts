import { Base, Login } from '../actions';

describe('Initialize login page', () => {
  before(() => {
    Base.goHomePage();
    Base.checkExistSelector('[data-qa="btn-login"]')
    Base.clickElement('btn-login');
  })

  it('Input login information', () => {
    Login.loginForm();
    cy.get('[data-qa="btn-logout"]').should('exist');
    cy.get('[data-qa="btn-login"]').should('not.exist');
    cy.get('[data-qa="account-info"]').should('exist');
  })
})
