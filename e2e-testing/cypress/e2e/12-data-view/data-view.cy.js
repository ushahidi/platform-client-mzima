import LoginFunctions from '../../functions/LoginFunctions';
import DataViewFunctions from '../../functions/DataViewFunctions/DataViewFunctions';

const loginFunctions = new LoginFunctions();
const dataViewFunctions = new DataViewFunctions();

describe('Automated Tests for Bulk Actions in Data View', () => {
  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it('Test Bulk Actions - Select All and Deselect All', () => {
    dataViewFunctions.test_select_all_and_deselect();
  });
});
