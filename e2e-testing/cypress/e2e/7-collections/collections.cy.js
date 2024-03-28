import LoginFunctions from "../../functions/LoginFunctions";
import CollectionFunctions from "../../functions/CollectionFunctions";

describe("Automated Tests for Collections", () => {
  const loginFunctions = new LoginFunctions();
  const collectionFunctions = new CollectionFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it("Creates Collection", () => {
    collectionFunctions.create_collection();
  });

  it.skip("Add post to collection", ()=>{
    collectionFunctions.add_post_to_collection();
  })
});
