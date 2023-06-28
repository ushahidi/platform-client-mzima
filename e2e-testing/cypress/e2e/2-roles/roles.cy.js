import LoginFunctions from "../../functions/LoginFunctions";
import RoleFunctions from "../../functions/RoleFunctions";

describe("Automated Tests for Roles", () => {
  const loginFunctions = new LoginFunctions();
  const roleFunctions = new RoleFunctions();

  before(() => {
    loginFunctions.login_as_admin();
  });
  it("Tests Role Creation, and Deletion", () => {
    roleFunctions.add_and_verify_role();
    roleFunctions.delete_role_and_verify_deletion();
  });

  //the above test should be split into smaller functions: create and delete at least
  //for easier readability

  // it("Verifies role", () => {
  //   cy.get(RoleLocators.createdRoleBtn).should("exist");
  // });
});
