import LoginFunctions from "../../functions/LoginFunctions";
import UserFunctions from "../../functions/UserFunctions";

describe("Automated Tests for Users", () => {
  const loginFunctions = new LoginFunctions();
  const userFunctions = new UserFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
  });
  it("Adds User", () => {
    userFunctions.add_user();
  });
  it("Deletes Single User", () => {
    userFunctions.delete_user();
  });
  it("Deletes Multiple Users in Bulk", () => {
    userFunctions.delete_multiple_users();
  });
});