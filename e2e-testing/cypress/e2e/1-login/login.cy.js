import LoginFunctions from "../../functions/LoginFunctions";
// import terminalLog from "../../functions/accessibilityTerminalLog";

describe("Login as Admin", () => {
  const loginFunctions = new LoginFunctions();

  it("Logs in as admin user", () => {
    loginFunctions.login_as_admin();
  });


  it("Should run accessibility audits", () => {
    cy.injectAxe()
    cy.checkA11y()
  });
});
