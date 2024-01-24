import LoginFunctions from "../../functions/LoginFunctions";
import ChangeContactEmailAddressFunctions from "../../functions/ChangeContactEmailAddressFunctions";

describe("Automated Tests for change contact email address", () => {
  const loginFunctions = new LoginFunctions();
  const changeContactEmailAddressFunctions = new ChangeContactEmailAddressFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
  });

  it("Steps to change contact email address", () => {
    changeContactEmailAddressFunctions.open_general_settings();
    changeContactEmailAddressFunctions.change_contact_email_address();
    changeContactEmailAddressFunctions.click_save_button();
    changeContactEmailAddressFunctions.reload_page();
    changeContactEmailAddressFunctions.check_new_contact_email_address_shows();
  });
});