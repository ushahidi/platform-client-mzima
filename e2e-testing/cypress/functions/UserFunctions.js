import UserLocators from "../locators/UserLocators";

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
  }

  delete_user_steps() {
    //type search term in bits for search to actually happen
    //typing all at once, search doesn't happen
    cy.get(".p-inputtext").type("Aut");
    cy.get(".p-inputtext").type("o");

    cy.get(UserLocators.bulkActionsBtn).click();
    cy.wait(1000);
    //add unique selector for checkbox
    cy.get(
      ".p-selectable-row > :nth-child(1) > .p-element > .p-checkbox > .p-checkbox-box > .p-checkbox-icon"
    ).click({ force: true });
    cy.get(UserLocators.deleteUsersBtn).click();
    cy.get(UserLocators.deleteUserConfirmBtn).click();
  }

  add_user() {
    this.open_user_page_steps();
    this.add_user_steps(
      "Auto User",
      "autouser@ushahidi.com",
      Cypress.env("ush_user_pwd")
    );
  }
  delete_user() {
    this.delete_user_steps();
  }
}

export default UserFunctions;
