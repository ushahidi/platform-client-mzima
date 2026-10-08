import DataViewLocators from '../../locators/DataViewLocators';
import LoginFunctions from '../LoginFunctions';

const loginFunctions = new LoginFunctions();

class DataViewFunctions {
  click_data_view_btn() {
    cy.get(DataViewLocators.dataViewBtn, { timeout: 15000 }).should('be.visible').click();
    cy.url().should('include', '/feed');
  }

  verify_post_appears_for_user() {
    this.click_data_view_btn();
    cy.get(DataViewLocators.postPreview)
      .children(DataViewLocators.postItem)
      .contains('Automated Title Response')
      .click();
    cy.get(DataViewLocators.postMenuDots).eq(0).click();
    cy.get(DataViewLocators.publishPostBtn).click();
    loginFunctions.logout();
    this.click_data_view_btn();
    cy.get(DataViewLocators.postPreview)
      .children(DataViewLocators.postItem)
      .contains('Automated Title Response');
  }

  select_all_posts() {
    cy.contains('button', 'Select All').click();
  }

  deselect_all_posts() {
    cy.contains('button', 'Deselect All').click();
  }

  verify_all_posts_selected() {
    cy.get(DataViewLocators.postItem).each(($post) => {
      cy.wrap($post).find(DataViewLocators.postCheckbox).should('be.checked');
    });
  }

  verify_no_posts_selected() {
    cy.get(DataViewLocators.postItem).each(($post) => {
      cy.wrap($post).find(DataViewLocators.postCheckbox).should('not.be.checked');
    });
  }

  test_select_all_and_deselect() {
    this.click_data_view_btn();
    cy.contains('button', 'Bulk Actions').click();
    this.select_all_posts();
    this.verify_all_posts_selected();
    this.deselect_all_posts();
    this.verify_no_posts_selected();
  }
}

export default DataViewFunctions;
