const CategoryLocators = {
  stngsBtn: '[data-qa="btn-settings"]',
  surveyBtn: '[data-qa="btn-surveys"]',
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
  addPostBtn: '[data-qa="submit-post-button"]',
  categoryTestSurvey: '[data-qa="add-post-modal-surveys-item701"]',
  addSurveyBtn: '[data-qa="btn-settings-create"]',
  surveyNameField: '[data-qa="name"]',
  surveyDescriptionField: '[data-qa="description"]',
  addNewFieldBtn: '[data-qa="btn-survey-add-field"]',
  selectCategoryField: '[data-qa="select-survey.categories"]',
  selectCategory: '[data-qa="tag-Automated Parent-Category...."]',
  saveFieldBtn: '[data-qa="btn-add-field"]',
  postTitleField: '[data-qa="null"]',
  postDescField: '[data-qa="description"]',
};

export const getUniqueSelector = (name) => name.split(' ').join('-').toLowerCase();

export default CategoryLocators;
