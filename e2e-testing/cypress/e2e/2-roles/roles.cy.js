import LoginFunctions from "../../functions/LoginFunctions";
import RoleFunctions from "../../functions/RoleFunctions";

describe("Automated Tests for Roles", () => {
  const loginFunctions = new LoginFunctions();
  const roleFunctions = new RoleFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });
  it("Create Role", () => {
    roleFunctions.add_and_verify_role();
  });

  it ("Deletes role", ()=>{
        roleFunctions.delete_role_and_verify_deletion();
  })
});
