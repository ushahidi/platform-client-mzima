import LoginFunctions from "../../functions/LoginFunctions";
import SurveyConfigurationFunctions from "../../functions/SurveyConfigurationFunctions";

describe("Automated Tests for Survey Configurations", () => {
  const loginFunctions = new LoginFunctions();
  const surveyConfigurationFunctions = new SurveyConfigurationFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it("Verify posts go into Published state as configured", () => {
    surveyConfigurationFunctions.require_posts_reviewed_before_published()
  });

  it("Steps to hide author information", () => {
    surveyConfigurationFunctions.toggle_hide_author_information();
    loginFunctions.logout();
    surveyConfigurationFunctions.login_as_different_user();
    surveyConfigurationFunctions.add_new_post();
    surveyConfigurationFunctions.check_for_accurate_author_name();
    loginFunctions.logout();
    surveyConfigurationFunctions.check_for_anonymous_author_name();
  });
});