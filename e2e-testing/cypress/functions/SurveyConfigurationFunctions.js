import SurveyConfigurationLocators from '../locators/SurveyConfigurationLocators';
import LoginFunctions from '../functions/LoginFunctions';

const loginFunctions = new LoginFunctions();

class SurveyConfigurationFunctions {
  open_settings() {
    cy.get(SurveyConfigurationLocators.settingsBtn).click();
  }

  open_surveys() {
    cy.get(SurveyConfigurationLocators.surveyBtn).click();
  }

  open_survey_to_configure() {
    cy.get(SurveyConfigurationLocators.configurationTestSurvey).click();
  }

  open_survey_configurations() {
    cy.get('#mat-tab-label-0-1').click({ force: true });
  }

  toggle_survey_review_required() {
    cy.get(SurveyConfigurationLocators.reviewRqrdTgl).click();
  }

  toggle_require_posts_review() {
    cy.get(SurveyConfigurationLocators.requirePostsReviewTgl).click();
  }
  toggle_hide_author_information() {
    cy.get(SurveyConfigurationLocators.hideAuthorTgl).click();
  }

  toggle_hide_exact_time_information() {
    cy.get('#mat-slide-toggle-4-input').click({ force: true });
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
  open_survey_to_submit() {
    cy.get(SurveyConfigurationLocators.surveyToSubmit).click();
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
    this.open_survey_to_submit();
    this.type_post_title('New Post Title');
    this.type_post_description('New Post Description');
    this.save_post();
    cy.get(SurveyConfigurationLocators.successBtn).click();
  }

  check_for_added_post_being_published() {
    cy.get(SurveyConfigurationLocators.clearBtn).click();
    cy.get(SurveyConfigurationLocators.surveySelectionList)
      .children(SurveyConfigurationLocators.surveyToVerify)
      .eq(0)
      .click({ force: true });
    cy.wait(3000);
    cy.get(SurveyConfigurationLocators.postPreview)
      .children(SurveyConfigurationLocators.postItem)
      .contains('New Post Title');
    cy.get(SurveyConfigurationLocators.postStatus).contains('Published');
  }

  check_for_accurate_author_name() {
    cy.get(SurveyConfigurationLocators.clearBtn).click();
    cy.get(SurveyConfigurationLocators.surveyToVerify).click();
    cy.get(SurveyConfigurationLocators.postPreview)
      .children(SurveyConfigurationLocators.postItem)
      .contains('New Post Title');
    cy.get('.post-info__username').contains('Automation User Member Role').should('be.visible');
  }

  check_for_anonymous_author_name() {
    cy.get(SurveyConfigurationLocators.clearBtn).click();
    cy.get('[data-qa="btn-data"]').click();
    cy.get(SurveyConfigurationLocators.surveyToVerify).click();
    cy.get(SurveyConfigurationLocators.postPreview)
      .children(SurveyConfigurationLocators.postItem)
      .contains('New Post Title');
    cy.get('.post-info__username').contains('Anonymous').should('be.visible');
  }

  check_for_time_post_was_added() {
    cy.get(SurveyConfigurationLocators.clearBtn).click();
    cy.get(SurveyConfigurationLocators.surveySelectionList)
      .children(SurveyConfigurationLocators.surveyToVerify)
      .eq(0)
      .click({ force: true });
    cy.wait(3000);
    cy.get(SurveyConfigurationLocators.postPreview)
      .children(SurveyConfigurationLocators.postItem)
      .contains('New Post Title');
    cy.get(SurveyConfigurationLocators.postDate);
  }

  require_posts_reviewed_before_published() {
    this.open_settings();
    this.open_surveys();
    this.open_survey_to_configure();
    this.open_survey_configurations();
    this.toggle_survey_review_required();
    this.save_survey_configurations();
    this.open_survey_to_configure();
    this.reopen_survey_configure_tab();
    this.verify_button_toggled();
    this.add_post();
    this.check_for_added_post_being_published();
  }

  hide_author_information_and_verify() {
    //change configuration survey
    this.open_settings();
    this.open_surveys();
    this.open_survey_to_configure();
    this.open_survey_configurations();
    this.toggle_survey_review_required();
    this.toggle_hide_author_information();
    this.save_survey_configurations();
    loginFunctions.logout();
    //login as a member
    loginFunctions.login_member_user();

    cy.visit(Cypress.env('baseUrl'));
    this.add_post();
    //skip checking for accurate author name since the user we are using for this test lacks the privilege to have the name show
    // this.check_for_accurate_author_name();

    loginFunctions.logout();

    cy.visit(Cypress.env('baseUrl'));
    this.check_for_anonymous_author_name();
  }

  hide_exact_time_information_and_verify() {
    this.open_settings();
    this.open_surveys();
    this.open_survey_to_configure();
    this.open_survey_configurations();
    this.toggle_survey_review_required();
    this.toggle_hide_exact_time_information();
    this.save_survey_configurations();
    loginFunctions.logout();
    this.add_post();
    this.check_for_time_post_was_added();
  }
}

export default SurveyConfigurationFunctions;
