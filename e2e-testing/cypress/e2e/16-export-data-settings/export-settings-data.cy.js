import ExportTagDataFunctions from '../../functions/ExportTagDataFunctions';
import LoginFunctions from '../../functions/LoginFunctions';

describe('Automated Tests for Exports and Tag Data', () => {
  const loginFunctions = new LoginFunctions();
  const exportTagDataFunctions = new ExportTagDataFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it('Exports all the data', () => {
    exportTagDataFunctions.confirm_all_data_export();
  });

  it('Exports data of select fields', () => {
    exportTagDataFunctions.confirm_select_data_export();
  });

  it('Cancels the data exporting process', () => {
    exportTagDataFunctions.cancel_data_export();
  });
});
