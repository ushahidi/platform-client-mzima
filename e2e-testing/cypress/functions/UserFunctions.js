import UserLocators from '../locators/UserLocators';

const usersToDelete = ['delete1', 'delete2', 'delete3'];

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
    cy.get('.p-inputtext').type('Aut');
    cy.get('.p-inputtext').type('o');

    cy.get(UserLocators.bulkActionsBtn).click();
    cy.wait(1000);
    //add unique selector for checkbox
    cy.get(
      '.p-selectable-row > :nth-child(1) > .p-element > .p-checkbox > .p-checkbox-box > .p-checkbox-icon',
    ).click({ force: true });
    cy.get(UserLocators.deleteUsersBtn).click();
    cy.get(UserLocators.deleteUserConfirmBtn).click();
  }

  delete_multiple_users(userNames = []) {
    if (userNames.length === 0) {
      // Use the default 'usersToDelete' array if 'userNames' is empty
      userNames = usersToDelete;
    }
  
    this.open_user_page_steps();
    cy.get(UserLocators.bulkActionsBtn).click();
    userNames.forEach((userName, index) => {
      // Type the user name in the search input
      cy.get('.p-inputtext').clear().type(userName);

      // Select the checkbox next to the user
      cy.get(`:contains("${userName}") .p-checkbox-box`).eq(0).click();

      // Clear the search input for the next iteration (except the last one)
    if (index < userNames.length - 1) {
      cy.get('.p-inputtext').clear();
    }
    });
  
    // Click the "Delete Users" button after selecting all users
    cy.get(UserLocators.deleteUsersBtn).click();
    // Confirm deletion
    cy.get(UserLocators.deleteUserConfirmBtn).click();
  }
  

  

  add_user() {
    this.open_user_page_steps();
    this.add_user_steps('Auto User', 'automateduser@ushahidi.com', Cypress.env('ush_user_pwd'));
  }
  delete_user() {
    this.open_user_page_steps();
    this.delete_user_steps();
  }
}

export default UserFunctions;
