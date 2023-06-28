import LoginFunctions from "../../functions/LoginFunctions";
import UserFunctions from "../../functions/UserFunctions";

describe("Automated Tests for Users", () => {
  const loginFunctions = new LoginFunctions();
  const userFunctions = new UserFunctions();

  before(() => {
    loginFunctions.login_as_admin();
  });
  it("Adds then Deletes User", () => {
    userFunctions.add_user();
    userFunctions.delete_user();
  });
});
