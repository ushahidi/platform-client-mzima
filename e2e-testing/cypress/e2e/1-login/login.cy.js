import LoginPage from "../../pages/LoginPage";

describe("Login as Admin", () => {
  const loginPage = new LoginPage();

  it("Logs in as admin user", () => {
    loginPage.login_as_admin();
  });
});
