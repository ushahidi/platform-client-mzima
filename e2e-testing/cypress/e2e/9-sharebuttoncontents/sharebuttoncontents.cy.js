import LoginFunctions from "../../functions/LoginFunctions";
import ShareButtonContentsFunctions from "../../functions/ShareButtonContentsFunctions";

describe("Automated Tests for Share Button Contents", () => {
  const loginFunctions = new LoginFunctions();
  const shareButtonContentsFunctions = new ShareButtonContentsFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it("Steps to verify Share Button Contents", () => {
    shareButtonContentsFunctions.verify_share_button_contents_map_view()
    shareButtonContentsFunctions.verify_share_button_contents_data_view();
  });
});