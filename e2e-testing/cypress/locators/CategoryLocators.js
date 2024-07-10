const CategoryLocators = {
  dataViewBtn: '[data-qa="btn-data"]',
  categoryFilterBtn: '[data-qa="categories-filter"]',
  stngsBtn: '[data-qa="btn-settings"]',
  ctgryBtn: '[data-qa="btn-categories"]',
  addCategoryBtn: '[data-qa="btn-settings-create"]',
  blkActionsBtn: '[data-qa="btn-settings-action"]',
  deleteBtn: '[data-qa="btn-settings-delete"]',
  confirmdeleteBtn: '[data-qa="btn-confirm-delete"]',
  ctgryNameField: '[data-qa="name"]',
  ctgryDescField: '[data-qa="description"]',
  saveCtgryBtn: '[data-qa="btn-category-save"]',
  selectParentCtgry: '[data-qa="select-parent-category"]',
  everyoneRadio: '[data-qa="everyone"]',
  specificRolesRadioOption: '[data-qa="specific-roles..."]',
  translationCheckbox: '[data-qa="translation"]',
  technologyCheckbox: '[data-qa="technology"]',
  adminCheckbox: '[data-qa="admin"]',
  categoryDeleteBtn: '[data-qa="btn-category-delete"]',
};

export const getUniqueSelector = (name) => name.split(' ').join('-').toLowerCase();

export default CategoryLocators;
