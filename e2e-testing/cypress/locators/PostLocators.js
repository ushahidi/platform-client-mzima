const PostLocators = {
  addPostBtn: '[data-qa="submit-post-button"]',
  srvyItemBtn: '[data-qa="add-post-modal-surveys-item125"]',
  successButton: '[data-qa="btn-confirm-success"]',
  submitBtn: '[data-qa="btn-post-item-submit"]',
  postPreview: '[data-qa="post-preview"]',
  postItem: '[data-qa="post-item"]',
  surveySelectionList: '[data-qa="survey-selection-list"]',
  surveySelectItem: '[data-qa="survey-select-item"]',
  confirmContent: '[data-qa="confirm-content"]',

  /* Input fields */
  titleField: '[data-qa="null"]',
  descField: '[data-qa="description"]',
  shtTextField: '[data-qa="short-text field"]',
  lngTextField: '[data-qa="long-text field"]',
  decimalField: '[data-qa="number-decimal field"]',
  intField: '[data-qa="number-integer field"]',
  dateField: '[data-qa="date-&-time-field"]',
  selectFieldBtn: '[data-qa="post-item-post-selectc5394e60-350d-4948-af81-6e8bf0502761"]',
  selectFieldOption1: '[data-qa="post-item-post-select-optionS1"]',
  radioFieldOption2: '[data-qa="radio-buttons-field-r2"]',
  checkboxFieldOption3: '[data-qa="checkboxes-field-f3"]',
  relatedPostField: '[data-qa="related-post-field"]',
  embedVideoField: '[data-qa="embed-video field"]',
};

export const getUniqueSelector = (name) => name.split(' ').join('-').toLowerCase();

export default PostLocators;
