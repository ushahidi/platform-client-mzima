import PrivateDeploymentLocators from '../locators/PrivateDeploymentLocators';

class PrivateDeploymentFunctions {
    open_general_settings() {
      cy.get(PrivateDeploymentLocators.settingsBtn).click();
      cy.get(PrivateDeploymentLocators.generalBtn).click();
    }

    click_private_deployment() {
        cy.get(PrivateDeploymentLocators.privateCheckbox).click();
    }
  
    click_save_button() {
      cy.get(PrivateDeploymentLocators.saveBtn).click();
    }

    check_private_deployment() {
        cy.get(PrivateDeploymentLocators.privateCheckbox).should('be.checked');
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
    }
  }
  
  export default PrivateDeploymentFunctions;
  