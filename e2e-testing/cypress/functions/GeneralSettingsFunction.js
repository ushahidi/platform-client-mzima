import GeneralSettingsLocator from "../locators/GeneralSettingsLocator";

class GeneralSettingsFunction{
    // navigate to general settings
    open_general_settings_page(){
        cy.get(GeneralSettingsLocator.settingsBtn).click();
    }

    // edit deployment name
    type_deployment_name(deploymentName){
        cy.wait(1000);
        cy.get(GeneralSettingsLocator.deploymentNameField).clear().type(deploymentName).should('have.value', deploymentName);

    }

    // edit description
    type_site_description(description){
        cy.wait(5000);
        cy.get(GeneralSettingsLocator.descriptionField).clear().type(description).should('have.value', description);
    }

    // click save button
    click_save_button(){
        cy.wait(1000);
        cy.get(GeneralSettingsLocator.saveButton).click();
    }

    // Api Key value
    get_api_key_field_value(){
        cy.wait(1000);
        cy.get(GeneralSettingsLocator.apiKeyField).should('not.be.empty');
    }



    // tests
    edit_general_page(){
        this.type_deployment_name("-Automated");
        this.click_save_button();
        this.type_site_description("Fixtures are a great way to mock data for responses to routes");
        this.click_save_button();
    }
}

export default GeneralSettingsFunctions;