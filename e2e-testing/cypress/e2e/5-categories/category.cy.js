import LoginFunctions from '../../functions/LoginFunctions';
import CategoryFunctions from '../../functions/CategoryFunctions';

describe('Automated Tests for Categories', () => {
  const loginFunctions = new LoginFunctions();
  const categoryFunctions = new CategoryFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it('Creates and verifies category', () => {
    categoryFunctions.open_category_creation_page_steps();
    categoryFunctions.add_category_details_steps();
    categoryFunctions.complete_add_category_steps();
    categoryFunctions.verify_created_category_exists();
  });

  it('Deletes a child Category - Bulk Actions', () => {
    categoryFunctions.open_category_list_page();
    //delete child category
    categoryFunctions.delete_category_bulk_actions('#mat-checkbox-37');
    categoryFunctions.verify_child_category_deleted();
  });
  it('Deletes a parent category - Bulk Actions', () => {
    categoryFunctions.open_category_list_page();

    categoryFunctions.delete_category_bulk_actions('#mat-checkbox-37');
    categoryFunctions.verify_parent_category_deleted();
  });

  it.skip('Deletes a Category - Category Page', () => {
    categoryFunctions.open_category_list_page();
    categoryFunctions.delete_category_details_page();
    categoryFunctions.verify_child_category_deleted();

    categoryFunctions.delete_category_details_page();
    categoryFunctions.verify_parent_category_deleted();
  });
});
