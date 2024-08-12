import LoginFunctions from '../../functions/LoginFunctions';
import DataViewFunctions from '../../functions/DataViewFunctions/DataViewFunctions';
import PostFunctions from '../../functions/PostsFunctions/PostFunctions';

const loginFunctions = new LoginFunctions();
const dataViewFunctions = new DataViewFunctions();

describe('Automated Tests for Posts in the Data View', () => {
  const postFunctions = new PostFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it('Verify posts appear as expected on Data View', () => {
    postFunctions.open_post_creation_form();
    postFunctions.fill_required_form_fields();
    postFunctions.complete_add_post_steps();
    dataViewFunctions.verify_post_appears_for_user();
  });

  it('Verify bulk actions select all posts', () => {
    dataViewFunctions.verify_bulk_actions_select_all_posts();
  });
});
