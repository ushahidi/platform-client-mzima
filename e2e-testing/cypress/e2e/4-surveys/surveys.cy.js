import LoginFunctions from "../../functions/LoginFunctions";
import SurveyFunctions from "../../functions/SurveyFunctions";

describe("Automated Tests for Surveys", () => {
  const loginFunctions = new LoginFunctions();
  const surveyFunctions = new SurveyFunctions();

  before(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it("Opens Survey Page", () => {
    surveyFunctions.open_survey_creation_page_steps();
    surveyFunctions.add_survey_details_steps();
    surveyFunctions.add_survey_fields_steps();
    surveyFunctions.complete_add_survey_steps();
    surveyFunctions.verify_created_survey_exists();
  });
});
