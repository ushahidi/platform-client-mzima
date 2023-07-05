const UserLocators = {
  stngsBtn: '[data-qa="btn-settings"]',
  usersBtn: '[data-qa="btn-users"]',
  addUserBtn: '[data-qa="btn-settings-create"]',
  nameField: '[data-qa="realname"]',
  emailField: '[data-qa="email"]',
  pwdField: '[data-qa="password"]',
  userRoleSlct: '[data-qa="user-role-select"]',
  roleAdmin: '[data-qa="admin"]',
  roleMember: '[data-qa="user"]',
  cancelBtn: '[data-qa="btn-user-cancel"]',
  saveBtn: '[data-qa="btn-user-save"]',
  // searchUserField: '[".p-inputtext"]',
  bulkActionsBtn: '[data-qa="btn-settings-action"]',
  checkUser:
    '[".p-datatable-tbody > :nth-child(1) > :nth-child(1) > .p-element > .p-checkbox > .p-checkbox-box"]',
  deleteUsersBtn: '[data-qa="btn-settings-delete"]',
  deleteUserCancelBtn: '[data-qa="btn-confirm-cancel"]',
  deleteUserConfirmBtn: '[data-qa="btn-confirm-delete"]',
};

export default UserLocators;
