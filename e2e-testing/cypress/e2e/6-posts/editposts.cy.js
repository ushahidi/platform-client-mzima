import LoginFunctions from "../../functions/LoginFunctions";
import EditPostFunctions from "../../functions/PostsFunctions/EditPostFunctions";

describe("Automated Tests for Edit Post", () => {
  const loginFunctions = new LoginFunctions();
  const editpostFunctions = new EditPostFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it("Steps for Edit Post", () => {
    editpostFunctions.edit_post_steps();
  });
});