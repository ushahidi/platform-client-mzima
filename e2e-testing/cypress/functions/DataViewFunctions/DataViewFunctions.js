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
      .contains('Automated Title Response');
    cy.get(DataViewLocators.postMenuDots).eq(0).click();
    cy.get(DataViewLocators.publishPostBtn).click();
    loginFunctions.logout();
    //check post appears for non logged in user
    this.click_data_view_btn();
    cy.get(DataViewLocators.postPreview)
      .children(DataViewLocators.postItem)
      .contains('Automated Title Response');
  }
}

export default DataViewFunctions;
