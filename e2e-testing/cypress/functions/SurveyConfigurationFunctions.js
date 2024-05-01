import SurveyConfigurationLocators from '../locators/SurveyConfigurationLocators';
import LoginFunctions from '../functions/LoginFunctions';
import PostLocators from '../locators/PostsLocators/PostLocators';

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
    cy.get(SurveyConfigurationLocators.hideTimeTgl).click({ force: true });
  }

  toggle_hide_exact_location_information() {
    cy.get(SurveyConfigurationLocators.hideLocationTgl).click();
  }

  save_survey_configurations() {
    cy.get(SurveyConfigurationLocators.saveSurveyBtn).click();
  }

  reopen_survey_configure_tab() {
    cy.get('#mat-tab-label-6-1').click({ force: true });
  }

  click_add_post_btn() {
    cy.get(SurveyConfigurationLocators.addPostBtn).click();
  }

  select_survey() {
    cy.get(SurveyConfigurationLocators.surveyItemBtn).click();
  }

  open_survey_to_submit() {
    cy.get(SurveyConfigurationLocators.surveyForConfigurationTests).click();
  }

  type_post_title(title) {
    cy.get(SurveyConfigurationLocators.postTitleField)
      .should('be.visible')
      .type(title, { force: true });
  }

  type_post_description(description) {
    cy.get(SurveyConfigurationLocators.postDescField).type(description);
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

  add_post_with_location() {
    this.click_add_post_btn();
    //open a specific survey with location field to test hiding location
    this.open_survey_to_submit();
    this.type_post_title('New Post Title for Location');
    this.type_post_description('New Post Description');
    cy.get(PostLocators.locationSearchField).type('nairobi county');
    this.save_post();
    cy.get(SurveyConfigurationLocators.successBtn).click();
  }

  check_for_hidden_exact_location() {
    //the check that hidden exact location works is check that unprivileged user sees rounded up lat and long values
    cy.get(SurveyConfigurationLocators.postItem).contains('New Post Title').click();
    cy.get(PostLocators.locationValues).should('be.visible').should('have.value', '-1.3 36.83');
    // cy.compareSnapshot('home-page', 1);
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
    //to verify, while logged in(as admin) verify time is displayed correctly
    cy.get(SurveyConfigurationLocators.clearBtn).click();
    cy.get(SurveyConfigurationLocators.surveySelectionList)
      .children(SurveyConfigurationLocators.surveyToVerify)
      .eq(0)
      .click({ force: true });
    // cy.wait(3000);
    cy.get(SurveyConfigurationLocators.postPreview)
      .children(SurveyConfigurationLocators.postItem)
      .contains('New Post Title');
    cy.get(SurveyConfigurationLocators.postDate).contains('just now');
    //logout and verify as non-logged in user, time is shown not the same as shown for admin user
    loginFunctions.logout();
    cy.get('[data-qa="btn-data"]').click();
    cy.get(SurveyConfigurationLocators.surveyToVerify).click();
    cy.get(SurveyConfigurationLocators.postPreview)
      .children(SurveyConfigurationLocators.postItem)
      .contains('New Post Title');
    //we'll check time doesn't say "just now" as it says when a privileged user is viewing
    cy.get(SurveyConfigurationLocators.postDate).should('not.contain', 'just now');
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
    this.toggle_hide_exact_time_information();
    this.save_survey_configurations();
    this.add_post();
    this.check_for_time_post_was_added();
  }

  hide_exact_location_information_and_verify() {
    this.open_settings();
    this.open_surveys();
    this.open_survey_to_configure();
    this.open_survey_configurations();
    this.toggle_survey_review_required();
    this.toggle_hide_exact_location_information();
    this.save_survey_configurations();
    loginFunctions.logout();
    this.add_post_with_location();
    this.check_for_hidden_exact_location();
  }
}

export default SurveyConfigurationFunctions;
