import SurveyConfigurationLocators from '../locators/SurveyConfigurationLocators';
import LoginFunctions from '../functions/LoginFunctions';
import LoginLocators from '../locators/LoginLocators';

const loginFunctions = new LoginFunctions();

class SurveyConfigurationFunctions {
  open_settings() {
    cy.get(SurveyConfigurationLocators.settingsBtn).click();
  }

  open_surveys() {
    cy.get(SurveyConfigurationLocators.surveyBtn).click();
  }

  open_particular_survey() {
    cy.get(SurveyConfigurationLocators.survey).click();
  }

  open_survey_configurations() {
    cy.get('#mat-tab-label-0-1').click({ force: true });
  }

  toggle_survey_review_required() {
    cy.get('#mat-slide-toggle-1-input').click({ force: true });
  }

  toggle_hide_exact_location_information() {
    cy.get('#mat-slide-toggle-3-input').click({ force: true });
  }

  save_survey_configurations() {
    cy.get(SurveyConfigurationLocators.saveSurveyBtn).click();
  }

  reopen_survey_configure_tab() {
    cy.get('#mat-tab-label-6-1').click({ force: true });
  }

  verify_button_toggled() {
    cy.get('#mat-slide-toggle-20-input').should('not.be.checked');
  }

  click_add_post_btn() {
    cy.get(SurveyConfigurationLocators.addPostBtn).click();
  }

  select_survey() {
    cy.get(SurveyConfigurationLocators.surveyItemBtn).click();
    cy.wait(1000);
  }

  type_post_title(title) {
    cy.get(SurveyConfigurationLocators.postTitleField).type(title, { force: true });
  }

  type_post_description(description) {
    cy.get(SurveyConfigurationLocators.postDescField).type(description, { force: true });
  }

  save_post() {
    cy.get(SurveyConfigurationLocators.savePostBtn).click();
  }
  add_post() {
    this.click_add_post_btn();
    this.select_survey();
    this.type_post_title('New Post Title');
    this.type_post_description('New Post Description');
    cy.get(SurveyConfigurationLocators.postCheckBox).click({ force: true });
    this.save_post();
    cy.get(SurveyConfigurationLocators.successBtn).click();
  }

  check_for_added_post_being_published() {
    cy.get(SurveyConfigurationLocators.clearBtn).click();
    cy.get(SurveyConfigurationLocators.surveySelectionList)
      .children(SurveyConfigurationLocators.surveySelectItem)
      .eq(0)
      .click({ force: true });
    cy.wait(3000);
    cy.get(SurveyConfigurationLocators.postPreview)
      .children(SurveyConfigurationLocators.postItem)
      .contains('New Post Title');
    cy.get(SurveyConfigurationLocators.postStatus).contains('Published');
  }

  check_for_hidden_exact_location() {
    cy.get(SurveyConfigurationLocators.clearBtn).click();
    cy.get(SurveyConfigurationLocators.surveySelectionList)
      .children(SurveyConfigurationLocators.surveySelectItem)
      .eq(0)
      .click({ force: true });
    cy.wait(3000);
    cy.get(SurveyConfigurationLocators.postPreview)
      .children(SurveyConfigurationLocators.postItem)
      .contains('New Post Title');
    cy.visit(`Cypress.env('baseUrl')/map`);
    cy.compareSnapshot('home-page');
  }

  require_posts_reviewed_before_published() {
    this.open_settings();
    this.open_surveys();
    this.open_particular_survey();
    this.open_survey_configurations();
    this.toggle_survey_review_required();
    this.save_survey_configurations();
    this.open_particular_survey();
    this.reopen_survey_configure_tab();
    this.verify_button_toggled();
    this.add_post();
    this.check_for_added_post_being_published();
  }

  hide_exact_location_information_and_verify() {
    this.open_settings();
    this.open_surveys();
    this.open_particular_survey();
    this.open_survey_configurations();
    this.toggle_survey_review_required();
    this.toggle_hide_exact_location_information();
    this.save_survey_configurations();
    loginFunctions.logout();
    this.add_post();
    this.check_for_hidden_exact_location();
  }
}

export default SurveyConfigurationFunctions;
