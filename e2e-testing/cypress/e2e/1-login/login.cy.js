import LoginFunctions from "../../functions/LoginFunctions";

describe("Login as Admin", () => {
  const loginFunctions = new LoginFunctions();

  it("Logs in as admin user", () => {
    loginFunctions.login_as_admin();
  });
});
