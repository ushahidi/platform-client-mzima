import LoginFunctions from "../../functions/LoginFunctions";
import SurveyConfigurationFunctions from "../../functions/SurveyConfigurationFunctions";

describe("Automated Tests for Survey Configurations", () => {
  const loginFunctions = new LoginFunctions();
  const surveyConfigurationFunctions = new SurveyConfigurationFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it("Steps to require posts to hide exact time information", () => {
    surveyConfigurationFunctions.hide_exact_time_information()
    loginFunctions.logout();
    surveyConfigurationFunctions.add_post();
    
  });
});