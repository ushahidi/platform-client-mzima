import SurveyConfigurationLocators from '../locators/SurveyConfigurationLocators';

class SurveyConfigurationFunctions {

    open_settings() {
        cy.get(SurveyConfigurationLocators.settingsBtn).click(); 
      }

    open_surveys() {
        cy.get(SurveyConfigurationLocators.surveyBtn).click();  
    }

    open_particular_survey(){
        cy.get(SurveyConfigurationLocators.survey).click();
    }

    click_survey_configure_tab() {
        cy.get('#mat-tab-label-0-1').click({force: true})
    }

    click_toggle_button(){
        cy.get('#mat-slide-toggle-1-input').click({force: true})
    }

    click_save_button() {
        cy.get(SurveyConfigurationLocators.saveSurveyBtn).click();
      }

    reclick_survey_configure_tab() {
        cy.get('#mat-tab-label-6-1').click({force: true})
    }

    check_toggle_button(){
        cy.get('#mat-slide-toggle-20-input').should('be.checked');
    }

    click_add_post_btn() {
        cy.get(SurveyConfigurationLocators.addPostBtn).click();
      }
    
      select_survey_item() {
        cy.get(SurveyConfigurationLocators.surveyItem).click();
      }
    
      type_post_title(title) {
        cy.get(SurveyConfigurationLocators.postTitleField).type(title).should('have.value', title);
      }
    
      type_post_description(description) {
        cy.get(SurveyConfigurationLocators.postDescField).type(description).should('have.value', description);
      }
    
      save_post() {
        cy.get(SurveyConfigurationLocators.savePostBtn).click();
      }
      add_post() {
        this.click_add_post_btn();
        this.select_survey_item();
        this.type_post_title('New Post Title');
        this.type_post_description('New Post Description');
        cy.get(SurveyConfigurationLocators.postCheckBox).click({ force: true });
        this.save_post();
      }

      check_for_added_post_being_published() {
        cy.get(SurveyConfigurationLocators.surveySelectionList)
            .children(SurveyConfigurationLocators.surveySelectItem)
            .eq(0)
            .click({force: true})
        cy.get(SurveyConfigurationLocators.postPreview).children(SurveyConfigurationLocators.postItem).contains('New Post Title');
        cy.get(SurveyConfigurationLocators.postStatus)
          .contains('Published')
      }

    
  require_posts_reviewed_before_published() {
    this.open_settings();
    this.open_surveys();
    this.open_particular_survey();
    this.click_survey_configure_tab();
    this.click_toggle_button();
    this.click_save_button();
    this.open_particular_survey();
    this.reclick_survey_configure_tab();
    this.check_toggle_button();
    this.add_post();
    this.check_for_added_post_being_published();

  }
}

export default SurveyConfigurationFunctions;
