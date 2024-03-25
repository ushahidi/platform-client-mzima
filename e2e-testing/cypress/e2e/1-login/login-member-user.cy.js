import LoginFunctions from "../../functions/LoginFunctions";

describe("Login as Member User", () => {
  const loginFunctions = new LoginFunctions();

  it("Logs in member user", () => {
    loginFunctions.login_member_user();
  });
});
