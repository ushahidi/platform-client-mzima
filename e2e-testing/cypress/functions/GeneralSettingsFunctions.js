import GeneralSettingsLocator from '../locators/GeneralSettingsLocator';
import LoginLocators from '../locators/LoginLocators';
import LoginFunctions from './LoginFunctions';

const loginFunctions = new LoginFunctions();

class GeneralSettingsFunctions {
  // navigate to general settings
  open_general_settings_page() {
    cy.get(GeneralSettingsLocator.settingsBtn).click();
  }

  // edit deployment name
  type_deployment_name(deploymentName) {
    cy.get(GeneralSettingsLocator.deploymentNameField)
      .type(deploymentName)
      .should(($input) => {
        const val = $input.val();
        expect(val).to.include(deploymentName);
      });
  }

  // edit description
  type_site_description(description) {
    cy.get(GeneralSettingsLocator.descriptionField)
      .clear()
      .type(description)
      .should('have.value', description);
  }

  // click save button
  click_save_button() {
    cy.get(GeneralSettingsLocator.saveButton).click();
  }

  // Api Key value
  verify_api_field_should_have_value() {
    cy.get(GeneralSettingsLocator.apiKeyField).invoke('val').should('not.be.empty');
  }

  // verify signup is disabled
  verify_signup_is_disabled() {
    cy.get(LoginLocators.loginModal).click();
    cy.get(GeneralSettingsLocator.modalTabs).eq(1).should('not.exist');
  }

  // disable signup and save
  disable_signup_and_save() {
    cy.get(GeneralSettingsLocator.disableUserSignupCheckbox).check({ force: true });
    cy.get(GeneralSettingsLocator.saveButton).click();
  }

  // disable signup and verify
  disable_signup_and_verify() {
    this.disable_signup_and_save();
    loginFunctions.logout();
    this.verify_signup_is_disabled();
  }

  verify_deployment_changes_reflect(deploymentName){
    cy.get(GeneralSettingsLocator.panelTitle).contains(deploymentName)
  }

  change_deployment_image(){
    cy.get(GeneralSettingsLocator.deleteImageBtn).click();
    this.click_save_button();
    cy.reload();
    cy.get(GeneralSettingsLocator.deploymentLogo).should('not.exist');
    cy.get('[type="file"]').selectFile('cypress/fixtures/turtle.jpg', {force: true});
    this.click_save_button();
    cy.reload();
    cy.get(GeneralSettingsLocator.deploymentLogo).should('have.attr', 'src', '/turtle.jpg')
  }
  
  // tests
  edit_general_page() {
    this.type_deployment_name('-Automated');
    this.type_site_description('Fixtures are a great way to mock data for responses to routes');
    this.click_save_button();
    cy.reload();
    this.verify_deployment_changes_reflect('-Automated');
  }

}

export default GeneralSettingsFunctions;
