import LoginFunctions from "../../functions/LoginFunctions";
import SurveyFilterFunctions from "../../functions/SurveyFilterFunctions";

describe("Automated Tests for Filter by Surveys", () => {
  const loginFunctions = new LoginFunctions();
  const surveyFilterFunctions = new SurveyFilterFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it("Checks filters by survey", () => {
    surveyFilterFunctions.click_data_view_btn();
    surveyFilterFunctions.check_post_filter_by_survey();
    surveyFilterFunctions.verify_count_on_results();
  });
});

describe("Automated Tests for Filter by Status", () => {
  const loginFunctions = new LoginFunctions();
  const surveyFilterFunctions = new SurveyFilterFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it("Checks filters by status", () => {
    surveyFilterFunctions.click_data_view_btn();
    surveyFilterFunctions.check_post_filter_by_status();
  });
  
});
