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
    cy.wait(1000);
    //check select all posts in the page
    cy.get('button:contains("Bulk Actions")').click();
    cy.get('button:contains("Select All")').click({ force: true });
    //verify all posts are selected
    cy.get(DataViewLocators.postPreview)
      .children(DataViewLocators.postItem)
      .find('.mat-checkbox-input')
      .should('have.attr', 'aria-checked', 'true');
    //change status of posts
    cy.get(DataViewLocators.controlActionsBtn)
      .find(DataViewLocators.markAsDropdown)
      .click({ force: true });
    cy.get('.mat-select-panel').find('#select-option-published').click();
    //verify all posts have changed status
    cy.get(DataViewLocators.postPreview)
      .children(DataViewLocators.postItem)
      .find(DataViewLocators.postStatus)
      .contains('Published')
      .should('be.visible');
  }
}

export default DataViewFunctions;
