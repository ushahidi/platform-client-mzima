import LoginFunctions from "../../functions/LoginFunctions";
import SettingsFunctions from "../../functions/SettingsFunctions";

describe("Automated Tests for Settings", () => {
  const loginFunctions = new LoginFunctions();
  const settingsFunctions = new SettingsFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
  });

  it("Disable user sign up and", () => {
    settingsFunctions.open_general_settings_page();
    settingsFunctions.disable_signup_and_verify();
  });
});