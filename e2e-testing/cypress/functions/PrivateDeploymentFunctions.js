import GeneralSettingsLocator from '../locators/GeneralSettingsLocator';

class PrivateDeploymentFunctions {
    open_general_settings() {
      cy.get(GeneralSettingsLocator.settingsBtn).click(); 
    }

    click_private_deployment() {
        cy.get(GeneralSettingsLocator.privateCheckbox).click();
    }
  
    click_save_button() {
      cy.get(GeneralSettingsLocator.saveButton).click();
    }

    check_private_deployment() {
        cy.get(GeneralSettingsLocator.privateCheckboxCheck).should('be.checked');
    }

    check_access_denied(){
        cy.get(GeneralSettingsLocator.denialMsg).should('exist');
    }

    check_contact_email(){
        cy.get(GeneralSettingsLocator.contactEmail).should('exist');
    }

    check_url_is_forbidden(){
        cy.url().should('include', '/forbidden')
    }
  
    make_deployment_private() {
        this.open_general_settings();
        this.click_private_deployment();
        this.click_save_button();
        this.check_private_deployment();
    }
  }
  
  export default PrivateDeploymentFunctions;
  