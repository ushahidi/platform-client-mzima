import LoginFunctions from "../../functions/LoginFunctions";
import GeneralSettingsFunctions from "../../functions/GeneralSettingsFunctions";
import PrivateDeploymentFunctions from "../../functions/PrivateDeploymentFunctions";

describe("Automated Tests for General Settings", () => {
  const loginFunctions = new LoginFunctions();
  const generalSettingsFunctions = new GeneralSettingsFunctions();
  const privateDeploymentFunctions = new PrivateDeploymentFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it("Test User Signup", () => {
    generalSettingsFunctions.open_general_settings_page();
    generalSettingsFunctions.disable_signup_and_verify();
  });

  it("Test Edit Survey Name and Description", () => {
    generalSettingsFunctions.open_general_settings_page();
    generalSettingsFunctions.edit_general_page();
  });

  it("Tests Private Deployment", () => {
    privateDeploymentFunctions.make_deployment_private()
    loginFunctions.logout();
    privateDeploymentFunctions.check_access_denied();
    privateDeploymentFunctions.check_contact_email();
    privateDeploymentFunctions.check_url_is_forbidden();
  });

  it("Verify API field", () => {
    generalSettingsFunctions.open_general_settings_page();
    generalSettingsFunctions.verify_api_field_should_have_value();
  })

  it("Tests Generating New API key", () => {
    generalSettingsFunctions.open_general_settings_page();
    generalSettingsFunctions.steps_to_generate_new_api_key();
  });

  it("Tests General Settings Map", () => {
    generalSettingsFunctions.open_general_settings_page();
    generalSettingsFunctions.verify_the_map_coordinates();
  });

  it("Test Change Deployment Image", () => {
    generalSettingsFunctions.open_general_settings_page();
    generalSettingsFunctions.change_deployment_image();
  });

});