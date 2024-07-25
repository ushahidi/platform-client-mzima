import LoginFunctions from '../../functions/LoginFunctions';
import DataViewFilterFunctions from '../../functions/DataViewFunctions/DataViewFilterFunctions';

const loginFunctions = new LoginFunctions();
const dataViewFilterFunctions = new DataViewFilterFunctions();

describe('Automated Tests for Post Filters in Data View', () => {
  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it('Filter posts by survey', () => {
    dataViewFilterFunctions.click_data_view_btn();
    dataViewFilterFunctions.check_post_filter_by_survey();
    dataViewFilterFunctions.verify_count_on_results();
  });

  it.skip('Filter posts by status', () => {
    dataViewFilterFunctions.click_data_view_btn();
    dataViewFilterFunctions.check_post_filter_by_status();
  });

  it('Filter posts by categories', () => {
    dataViewFilterFunctions.click_data_view_btn();
    dataViewFilterFunctions.check_post_filter_by_categories();
  });
});
