import LoginFunctions from "../../functions/LoginFunctions";

describe("Verify Invalid Credentials on Login", () => {
  const loginFunctions = new LoginFunctions();

  it("Logs in with invalid credentials", () => {
    loginFunctions.verify_negative_login();
  });
});
