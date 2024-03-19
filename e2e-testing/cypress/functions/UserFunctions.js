import UserLocators from '../locators/UserLocators';

class UserFunctions {
  open_user_page_steps() {
    cy.wait(2000);
    cy.get(UserLocators.stngsBtn).click();
    cy.get(UserLocators.usersBtn).click();
  }

  add_user_steps(userName, userEmail, pwd) {
    cy.get(UserLocators.addUserBtn).click();
    cy.get(UserLocators.nameField).type(userName);
    cy.get(UserLocators.emailField).type(userEmail);
    cy.get(UserLocators.pwdField).type(pwd);
    cy.get(UserLocators.userRoleSlct).click();
    cy.get(UserLocators.roleAdmin).click();
    cy.get(UserLocators.saveBtn).click();
    cy.wait(1000); //without this wait, the test fails. next step is triggered quick before the save function completes
  }

  delete_user_steps() {
    //type search term in bits for search to actually happen
    //typing all at once, search doesn't happen
    cy.get(UserLocators.searchUserField).type('Aut');
    cy.get(UserLocators.searchUserField).type('o');

    cy.get(UserLocators.bulkActionsBtn).click();
    cy.wait(1000);
    cy.get(UserLocators.checkUser).click();
    cy.get(UserLocators.deleteUsersBtn).click();
    cy.get(UserLocators.deleteUserConfirmBtn).click();
  }

  verify_user_steps() {
    cy.wait(2000);
    cy.get(UserLocators.searchUserField).type('automateduser@ushahidi.com');
    cy.get(UserLocators.userData).contains('automateduser@ushahidi.com');

  }

  verify_user_list_visible_steps(){
    let getUserEmailCount;
    cy.get(UserLocators.userData).each((item, index) => {
      cy.wrap(item)
        .get(UserLocators.userEmail).then(($value) => {
          getUserEmailCount = $value.length
          cy.wrap(getUserEmailCount).should('be.gte', 0)
      })
    })

  }

  add_user() {
    this.open_user_page_steps();
    this.add_user_steps('Auto User', 'automateduser@ushahidi.com', Cypress.env('ush_user_pwd'));
  }
  delete_user() {
    this.open_user_page_steps();
    this.delete_user_steps();
  }
  verify_user(){
    this.open_user_page_steps();
    this.verify_user_steps();
  }
  verify_user_list_visible(){
    this.open_user_page_steps();
    this.verify_user_list_visible_steps();
  }
}

export default UserFunctions;
