import LoginFunctions from "../../functions/LoginFunctions";
import EditPostFunctions from "../../functions/EditPostFunctions";

describe("Automated Tests for Edit Post", () => {
  const loginFunctions = new LoginFunctions();
  const editpostFunctions = new EditPostFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
  });

  it("Steps for Edit Post", () => {
    editpostFunctions.edit_post_steps();
  });
});