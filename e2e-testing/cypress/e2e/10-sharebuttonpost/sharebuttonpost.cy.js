import LoginFunctions from "../../functions/LoginFunctions";
import ShareButtonPostFunctions from "../../functions/ShareButtonPostFunctions";

describe("Automated Tests to Verify Share Button for Post ", () => {
  const loginFunctions = new LoginFunctions();
  const shareButtonPostFunctions = new ShareButtonPostFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
  });

  it("Checks filters by survey", () => {
    shareButtonPostFunctions.click_data_view_btn();
    shareButtonPostFunctions.verify_share_button_on_post();
  });
});