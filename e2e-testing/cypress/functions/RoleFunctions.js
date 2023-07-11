import RoleLocators from "../locators/RoleLocators";

class RoleFunctions {
  open_roles_page() {
    cy.get(RoleLocators.stngsBtn).click();
    cy.get(RoleLocators.roleBtn).click();
  }

  add_role(roleName, roleDescription) {
    cy.get(RoleLocators.addRoleBtn).click();
    cy.get(RoleLocators.roleNameFld).type(roleName);
    cy.get(RoleLocators.roleDescFld).type(roleDescription);
    cy.get(RoleLocators.manageUsersBox).click();
    cy.get(RoleLocators.addSaveBtn).click();
  }

  verify_role_exist() {
    cy.get(RoleLocators.createdRoleBtn).should("exist");
  }

  delete_role() {
    cy.get(RoleLocators.createdRoleBtn).click();
    cy.wait(1000);
    cy.get(RoleLocators.deleteRoleBtn).click();
    cy.get(RoleLocators.deleteConfirmBtn).click();
  }

  verify_role_deleted() {
    cy.get(RoleLocators.createdRoleBtn).should("not.exist");
  }
  add_and_verify_role() {
    this.open_roles_page();
    this.add_role("Automated Role", "An automated description for automated role");
    this.verify_role_exist();
  }
  delete_role_and_verify_deletion() {
    this.delete_role();
    this.verify_role_deleted();
  }
}

export default RoleFunctions;
