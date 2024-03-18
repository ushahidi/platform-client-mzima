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
        cy.get('#mat-slide-toggle-4-input').click({force: true})
    }

    click_save_button() {
        cy.get(SurveyConfigurationLocators.saveSurveyBtn).click();
      }

    click_add_post_btn() {
        cy.get(SurveyConfigurationLocators.addPostBtn).click();
      }

      select_survey_item() {
        cy.get(SurveyConfigurationLocators.surveyItemBtn).click();
        cy.wait(1000);
      }

      type_post_title(title) {
        cy.get(SurveyConfigurationLocators.postTitleField).type(title, {force: true});
      }

      type_post_description(description) {
        cy.get(SurveyConfigurationLocators.postDescField).type(description, {force: true});
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
        cy.wait(1000);
        cy.get(SurveyConfigurationLocators.successBtn).click();
      }

      check_for_added_post_time() {
        cy.get(SurveyConfigurationLocators.clearBtn).click();
        cy.get(SurveyConfigurationLocators.surveySelectionList)
            .children(SurveyConfigurationLocators.surveySelectItem)
            .eq(0)
            .click({force: true})
        cy.wait(3000);
        cy.get(SurveyConfigurationLocators.postPreview).children(SurveyConfigurationLocators.postItem).contains('New Post Title');
        cy.get(SurveyConfigurationLocators.postDate)
      }


  hide_exact_time_information() {
    this.open_settings();
    this.open_surveys();
    this.open_particular_survey();
    this.click_survey_configure_tab();
    this.click_toggle_button();
    this.click_save_button();
  }
}

export default SurveyConfigurationFunctions;