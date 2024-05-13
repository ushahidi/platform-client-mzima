import ShareButtonContentsLocators from '../locators/ShareButtonContentsLocators';
import DataViewLocators from '../locators/DataViewLocators';

class ShareButtonContentsFunctions {
  click_map_view_btn() {
    cy.get(ShareButtonContentsLocators.mapViewBtn).click();
  }

  click_share_btn() {
    cy.wait(1000);
    cy.get(ShareButtonContentsLocators.shareBtn).click();
  }

  verify_survey_web_map_view_address() {
    cy.get(ShareButtonContentsLocators.surveyWebAddress).should(
      'have.value',
      Cypress.env().baseUrl + 'map',
    );
  }

  verify_twitter_link() {
    cy.get(ShareButtonContentsLocators.shareTwitterBtn);
  }

  verify_facebook_link() {
    cy.get(ShareButtonContentsLocators.shareFacebookBtn);
  }

  close_modal() {
    cy.get(ShareButtonContentsLocators.btnClose).click();
  }

  click_data_view_btn() {
    cy.get(ShareButtonContentsLocators.dataViewBtn).click();
  }

  verify_survey_web_data_view_address() {
    //add step to wait for result count to show up. without this, the step to open  share button is called before the page content loads up and that fails the test
    cy.get(DataViewLocators.feedPageResults).contains('Current results: 20 / 517');
    cy.get(ShareButtonContentsLocators.surveyWebAddress).should(
      'have.value',
      Cypress.env().baseUrl + 'feed?page=1',
    );
  }

  verify_share_button_contents_map_view() {
    this.click_map_view_btn();
    this.click_share_btn();
    this.verify_survey_web_map_view_address();
    this.verify_twitter_link();
    this.verify_facebook_link();
    this.close_modal();
  }

  verify_share_button_contents_data_view() {
    this.click_data_view_btn();
    this.click_share_btn();
    this.verify_survey_web_data_view_address();
  }
}

export default ShareButtonContentsFunctions;
