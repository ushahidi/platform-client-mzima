import LoginFunctions from '../../functions/LoginFunctions';
import DataViewFilterFunctions from '../../functions/DataViewFilterFunctions';
import PostFunctions from '../../functions/PostsFunctions/PostFunctions';

describe('Automated Tests for Post Filters in Data View', () => {
  const loginFunctions = new LoginFunctions();
  const dataViewFilterFunctions = new DataViewFilterFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it('Filter posts by survey', () => {
    dataViewFilterFunctions.click_data_view_btn();
    dataViewFilterFunctions.check_post_filter_by_survey();
    dataViewFilterFunctions.verify_count_on_results();
  });

  it('Filter posts by status', () => {
    dataViewFilterFunctions.click_data_view_btn();
    dataViewFilterFunctions.check_post_filter_by_status();
  });
});

describe('Automated Tests for Posts in the Data View', () => {
  const loginFunctions = new LoginFunctions();
  const dataViewFilterFunctions = new DataViewFilterFunctions();
  const postFunctions = new PostFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it('Verify posts appear as expected on Data View', () => {
    postFunctions.open_post_creation_form();
    postFunctions.fill_required_form_fields();
    postFunctions.complete_add_post_steps();
    dataViewFilterFunctions.verify_post_appears_for_user();
  });
});
