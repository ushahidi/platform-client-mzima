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
    surveyConfigurationFunctions.require_posts_reviewed_before_published();
  });

  it("Steps to require posts to hide exact time information", () => {
    surveyConfigurationFunctions.hide_exact_time_information();
    loginFunctions.logout();
    surveyConfigurationFunctions.add_post();
    surveyConfigurationFunctions.check_for_time_post_was_added();
  });
});