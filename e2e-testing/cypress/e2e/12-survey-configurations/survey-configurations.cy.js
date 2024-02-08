import LoginFunctions from "../../functions/LoginFunctions";
import SurveyConfigurationFunctions from "../../functions/SurveyConfigurationFunctions";

describe("Automated Tests for Survey Configurations", () => {
  const loginFunctions = new LoginFunctions();
  const surveyConfigurationFunctions = new SurveyConfigurationFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it("Steps to require posts to be reviewed before publishing", () => {
    surveyConfigurationFunctions.require_posts_reviewed_before_published()
  });
});