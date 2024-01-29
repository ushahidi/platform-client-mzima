import LoginFunctions from "../../functions/LoginFunctions";
import GeneralSettingsFunctions from "../../functions/GeneralSettingsFunctions";

describe("Automated Tests for Settings", () => {
  const loginFunctions = new LoginFunctions();
  const generalSettingsFunctions = new GeneralSettingsFunctions();

  before(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it("Opens Settings Page", () => {
    generalSettingsFunctions.open_general_settings_page();
    generalSettingsFunctions.edit_general_page();
  });
});

