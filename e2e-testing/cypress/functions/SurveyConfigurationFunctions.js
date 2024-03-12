import SurveyConfigurationLocators from '../locators/SurveyConfigurationLocators';
import LoginFunctions from "../functions/LoginFunctions";
import LoginLocators from '../locators/LoginLocators';

const loginFunctions = new LoginFunctions();


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

    click_hide_author_toggle_button(){
        cy.get('#mat-slide-toggle-2-input').click({force: true})
    }

    click_save_button() {
        cy.get(SurveyConfigurationLocators.saveSurveyBtn).click();
    }

    type_email(email) {
        cy.wait(1000);
        cy.get(LoginLocators.emailField).type(email, {force: true});
    }
    
    type_password(password) {
        cy.get(LoginLocators.passwordField).clear({force: true}).type(password, {force: true});
    }

    login_as_different_user(){
        cy.get(SurveyConfigurationLocators.authBtn).click();
        this.type_email('testuseremail@xtz.com');
        this.type_password('Password@Cypress2023');
        cy.get(LoginLocators.loginButton).click();
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
        cy.get(SurveyConfigurationLocators.successBtn).click();
    }

    click_hide_author_information(){
        this.open_settings();
        this.open_surveys();
        this.open_particular_survey();
        this.click_survey_configure_tab();
        this.click_hide_author_toggle_button();
        this.click_save_button();
    }

    check_for_accurate_author_name() {
        cy.get(SurveyConfigurationLocators.clearBtn).click();
        cy.get(SurveyConfigurationLocators.surveySelectionList)
            .children(SurveyConfigurationLocators.surveySelectItem)
            .eq(0)
            .click({force: true})
        cy.wait(3000);
        cy.get(SurveyConfigurationLocators.postPreview).children(SurveyConfigurationLocators.postItem).contains('New Post Title');
        cy.get(SurveyConfigurationLocators.postAuthor).contains(Cypress.env('ush_user_name'))
    }

    check_for_anonymous_author_name() {
        cy.get(SurveyConfigurationLocators.clearBtn).click();
        cy.get(SurveyConfigurationLocators.surveySelectionList)
            .children(SurveyConfigurationLocators.surveySelectItem)
            .eq(0)
            .click({force: true})
        cy.wait(3000);
        cy.get(SurveyConfigurationLocators.postPreview).children(SurveyConfigurationLocators.postItem).contains('New Post Title');
        cy.get(SurveyConfigurationLocators.postAuthor).contains("Anonymous")
    }

    add_new_post() {
    this.open_particular_survey();
    this.add_post();
    }
}

export default SurveyConfigurationFunctions;