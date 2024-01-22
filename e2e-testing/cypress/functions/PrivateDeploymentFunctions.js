import PrivateDeploymentLocators from '../locators/PrivateDeploymentLocators';
import LoginFunctions from '../../functions/LoginFunctions'
import { functions } from 'lodash';
class PrivateDeploymentFunctions {
    open_general_settings() {
      cy.get(PrivateDeploymentLocators.settingsBtn).click();
    }

    click_private_deployment() {
        cy.get(PrivateDeploymentLocators.privateCheckbox).click();
    }
  
    click_save_button() {
      cy.get(GeneralSettingsLocator.saveButton).click();
    }

    check_private_deployment() {
        cy.get(PrivateDeploymentLocators.privateCheckbox).should('be.checked');
    }

    logout_user(){
        LoginFunctions.logout();
    }

    check_access_denied(){
        cy.get(PrivateDeploymentLocators.denialMsg).should('exist');
    }

    check_contact_email(){
        cy.get(PrivateDeploymentLocators.contactEmail).should('exist');
    }

    check_url_is_forbidden(){
        cy.url().should('include', '/forbidden')
    }
  
    make_deployment_private() {
        this.open_general_settings();
        this.click_private_deployment();
        this.click_save_button();
        this.check_private_deployment();
        this.logout_user();
        this.check_access_denied();
        this.check_contact_email();
        this.check_url_is_forbidden();
    }
  }
  
  export default PrivateDeploymentFunctions;
  