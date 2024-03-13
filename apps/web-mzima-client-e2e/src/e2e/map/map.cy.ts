import { Base } from '../actions';
import 'cypress-axe'

describe('Initialize map page', () => {
  it('Visits the initial project page', () => {
    Base.goToPage('/map');
    Base.checkContainElement('page-title', 'Map view');

    // Perform accessibility checks
    cy.injectAxe();
    cy.checkA11y();
  })
})
