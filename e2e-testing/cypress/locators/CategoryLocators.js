const CategoryLocators = {
  stngsBtn: '[data-qa="btn-settings"]',
  ctgryBtn: '[data-qa="btn-categories"]',
  addCategoryBtn: '[data-qa="btn-settings-create"]',
  ctgryNameField: '[data-qa="name"]',
  ctgryDescField: '[data-qa="description"]',
  saveCtgryBtn: '[data-qa="btn-category-save"]',
  selectParentCtgry: '[data-qa="select-parent-category"]',
  everyoneRadio: '[data-qa="everyone"]',
  specificRolesRadioOption: '[data-qa="specific-roles..."]',
  translationCheckbox: '[data-qa="translation"]',
  technologyCheckbox: '[data-qa="technology"]',
  adminCheckbox: '[data-qa="admin"]',
};

export const getUniqueSelector = (name) => name.split(' ').join('-').toLowerCase();

export default CategoryLocators;
