import ShareButtonContentsLocators from '../locators/ShareButtonContentsLocators';

class ShareButtonContentsFunctions {
  click_share_btn() {
    cy.get(ShareButtonContentsLocators.shareBtn).click();
    cy.get('[data-qa="share-modal"]').should('be.visible');
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
    cy.get(ShareButtonContentsLocators.surveyWebAddress).should(
      'have.value',
      Cypress.env().baseUrl + 'feed?page=1',
    );
  }

  verify_share_button_contents_map_view() {
    cy.wait(2000);
    this.click_share_btn();
    this.verify_survey_web_map_view_address();
    this.verify_twitter_link();
    this.verify_facebook_link();
    this.close_modal();
  }

  verify_share_button_contents_data_view() {
    this.click_data_view_btn();
    //this will wait for the posts to be visible, and then click on share button
    cy.get('[postid="102630"] > .post').should('be.visible');
    this.click_share_btn();
    this.verify_survey_web_data_view_address();
  }
}

export default ShareButtonContentsFunctions;
