import DataViewLocators from '../../locators/DataViewLocators';
import LoginFunctions from '../LoginFunctions';

const loginFunctions = new LoginFunctions();

class DataViewFunctions {
  click_data_view_btn() {
    cy.get(DataViewLocators.dataViewBtn).click();
    cy.url().should('include', '/feed');
  }

  verify_post_appears_for_user() {
    this.click_data_view_btn();
    //check post appears for admin user
    cy.get(DataViewLocators.postPreview)
      .children(DataViewLocators.postItem)
      .contains('Automated Title Response')
      .click();
    cy.get(DataViewLocators.postMenuDots).eq(0).click();
    cy.get(DataViewLocators.publishPostBtn).click();
    loginFunctions.logout();
    //check post appears for non logged in user
    this.click_data_view_btn();
    cy.get(DataViewLocators.postPreview)
      .children(DataViewLocators.postItem)
      .contains('Automated Title Response');
  }

  verify_bulk_actions_select_all_posts() {
    this.click_data_view_btn();
    //check select all posts in the page
    cy.get(DataViewLocators.bulkActionsBtn).click();
    cy.get(DataViewLocators.controlActionsBtn).eq(2).click();
    //verify all posts are selected
    cy.get(DataViewLocators.postItem)
      .find('.mat-checkbox-input')
      .should('have.attr', 'aria-checked', true);
    //change status of posts

    //verify all posts have changed status
  }
}

export default DataViewFunctions;
