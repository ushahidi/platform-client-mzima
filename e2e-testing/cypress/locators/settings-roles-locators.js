// Data attributes locators
export const rolesSettingsMenu = '[data-qa="btn-roles"]';
export const addRoleButton = '[data-qa="btn-add-role"]';
export const roleItemHeader = '[data-qa="role-item-header"]';
export const roleNameInput = '[placeholder="Enter role name"]';
export const roleDescriptionInput = '[placeholder="Enter role description"]';
export const rolesPermissionsCheckboxes = {
  'Manage Users': '[data-qa="manage-users"]',
  'Manage Posts': '[data-qa="manage-posts"]',
  'Manage Settings': '[data-qa="manage-settings"]',
  'Bulk Data Import and Export': '[data-qa="bulk-data import and export"]',
  'Edit their own posts': '[data-qa="edit-their own posts"]',
  'Manage Collections and Saved Searches': '[data-qa="manage-collections and saved searches"]',
  'Delete Posts': '[data-qa="delete-posts"]',
  'Delete Their Own Posts': '[data-qa="delete-their own posts"]',
};
export const saveRoleButton = '[data-qa="btn-save-role"]';
export const deleteRoleButton = '[data-qa="btn-delete-role"]';
export const deleteConfirmationModal = '#confirm-modal';
export const deleteConfirmationModalButton = '[data-qa="btn-confirm-delete"]';

// Text locators
export const rolesSettingsMenuInfo =
  'Create and manage the type of permissions your users have on your deployment.';
export const addRolePermissionsDescription =
  'These options control what this type of role can make changes to. Visit our support guides to find out more.';

// Dynamic locators
export const roleLink = (roleName) => `[data-qa="role-link-${roleName.toLowerCase()}"]`;
