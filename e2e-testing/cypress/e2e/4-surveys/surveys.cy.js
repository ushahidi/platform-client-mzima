import LoginPage from "../../pages/LoginPage";
import SurveyPage from "../../pages/SurveyPage";

describe("Automated Tests for Surveys", () => {
  const loginPage = new LoginPage();
  const surveyPage = new SurveyPage();

  before(() => {
    loginPage.login_as_admin();
  });

  it("Opens Survey Page", () => {
    surveyPage.open_survey_creation_page_steps();
    surveyPage.add_survey_details_steps();
    surveyPage.add_survey_fields_steps();
    surveyPage.complete_add_survey_steps();
    surveyPage.verify_created_survey_exists();
  });
});
