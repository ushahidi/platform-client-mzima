import LoginFunctions from "../../functions/LoginFunctions";
import SignupFunctions from "../../functions/SignupFunctions";
import SurveyConfigurationFunctions from "../../functions/SurveyConfigurationFunctions";

describe("Automated Tests for Survey Configurations", () => {
  const loginFunctions = new LoginFunctions();
  const surveyConfigurationFunctions = new SurveyConfigurationFunctions();
  const signupFunctions = new SignupFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it("Steps to hide author information", () => {
    surveyConfigurationFunctions.click_hide_author_information();
    loginFunctions.logout();
    signupFunctions.login_created_user();
    surveyConfigurationFunctions.add_new_post();
    surveyConfigurationFunctions.check_for_accurate_author_name();
    loginFunctions.logout();
    surveyConfigurationFunctions.check_for_anonymous_author_name();
  });
});