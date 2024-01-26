import ShareButtonContentsLocators from '../locators/ShareButtonContentsLocators';

class ShareButtonContentsFunctions {
  click_map_view_btn() {
    cy.get(ShareButtonContentsLocators.mapViewBtn).click();
  }

  click_share_btn() {
    cy.wait(1000)
    cy.get(ShareButtonContentsLocators.shareBtn).click();
  }

  load_share_modal(){
    cy.get(ShareButtonContentsLocators.shareModal)
  }

  verify_survey_web_map_view_address(){
    cy.get(ShareButtonContentsLocators.surveyWebAddress).should('have.value', "http://localhost:4200/map")
  }

  verify_twitter_link(){
    cy.get(ShareButtonContentsLocators.shareTwitterBtn)
  }

  verify_facebook_link(){
    cy.get(ShareButtonContentsLocators.shareFacebookBtn)
  }

  close_modal(){
    cy.get(ShareButtonContentsLocators.btnClose).click();
  }

  click_data_view_btn(){
    cy.get(ShareButtonContentsLocators.dataViewBtn).click();
  }

  verify_survey_web_data_view_address(){
    cy.get(ShareButtonContentsLocators.surveyWebAddress).should('have.value', "http://localhost:4200/feed")
  }

 verify_share_button_contents_map_view() {
    this.click_map_view_btn();
    this.click_share_btn();
    this.load_share_modal();
    this.verify_survey_web_map_view_address();
    this.verify_twitter_link();
    this.verify_facebook_link();
    this.close_modal();
  }

  verify_share_button_contents_data_view() {
    this.click_data_view_btn();
    this.click_share_btn();
    this.load_share_modal();
    this.verify_survey_web_data_view_address();

  }

}

export default ShareButtonContentsFunctions;
