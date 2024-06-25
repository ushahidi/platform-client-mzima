import LoginFunctions from '../../functions/LoginFunctions';
import ShareButtonPostFunctions from '../../functions/PostsFunctions/ShareButtonPostFunctions';

describe('Automated Tests to Verify Share Button for Post ', () => {
  const loginFunctions = new LoginFunctions();
  const shareButtonPostFunctions = new ShareButtonPostFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it('Checks url on Share modal for posts', () => {
    shareButtonPostFunctions.click_data_view_btn();
    shareButtonPostFunctions.verify_share_button_on_post();
  });
});
