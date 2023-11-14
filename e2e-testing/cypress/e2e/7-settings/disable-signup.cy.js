import LoginFunctions from "../../functions/LoginFunctions";
import GeneralSettingsFunctions from "../../functions/GeneralSettingsFunctions";

describe("Automated Tests for Settings", () => {
  const loginFunctions = new LoginFunctions();
  const generalSettingsFunctions = new GeneralSettingsFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
  });

  it("Disable user sign up and", () => {
    generalSettingsFunctions.open_general_settings_page();
    generalSettingsFunctions.disable_signup_and_verify();
  });
});