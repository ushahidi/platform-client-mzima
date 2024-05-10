/// <reference types="Cypress" />

import CategoryLocators, { getUniqueSelector } from '../locators/CategoryLocators';

class CategoryFunctions {
  constructor() {
    this.uniqueParentCtgry = `Automated Parent Category-${Math.floor(Math.random() * 900) + 100}`;
    this.uniqueChildCtgry = `Automated Child Category-${Math.floor(Math.random() * 900) + 100}`;
  }
  open_category_creation_page_steps() {
    cy.get(CategoryLocators.stngsBtn).click();
    cy.get(CategoryLocators.ctgryBtn).click();
    cy.get(CategoryLocators.addCategoryBtn).click();
  }

  add_category_details_steps() {
    cy.get(CategoryLocators.ctgryNameField).type(this.uniqueParentCtgry);
    cy.get(CategoryLocators.ctgryDescField).type('Automated Description');
    cy.get(CategoryLocators.everyoneRadio).click();
  }

  complete_add_category_steps() {
    cy.get(CategoryLocators.saveCtgryBtn).click();
  }

  add_parent_category_with_restrictions() {
    cy.get(CategoryLocators.ctgryNameField).type(this.uniqueParentCtgry);
    cy.get(CategoryLocators.ctgryDescField).type('Automated parent description');
    cy.get(CategoryLocators.specificRolesRadioOption).click();
    cy.get(CategoryLocators.translationCheckbox).click();
    cy.get(CategoryLocators.technologyCheckbox).click();
    this.complete_add_category_steps();
  }

  add_child_category() {
    cy.get(CategoryLocators.addCategoryBtn).click();
    cy.get(CategoryLocators.ctgryNameField).type(this.uniqueChildCtgry);
    cy.get(CategoryLocators.ctgryDescField).type('Automated child description');
    cy.get(CategoryLocators.selectParentCtgry).click();
    cy.get(`[data-qa="${getUniqueSelector(this.uniqueParentCtgry)}"]`).click();
    this.complete_add_category_steps();
  }

  verify_child_category_exists_under_parent() {
    //click dropdown to reveal child
    cy.get('[data-qa="toggle-children"]').eq(9).click();
    cy.get(
      `[data-qa="${getUniqueSelector(this.uniqueChildCtgry)}-(${getUniqueSelector(
        this.uniqueParentCtgry,
      )})"]`,
    ).should('exist');
  }

  open_child_category() {
    cy.get(
      `[data-qa="${getUniqueSelector(this.uniqueChildCtgry)}-(${getUniqueSelector(
        this.uniqueParentCtgry,
      )})"]`,
    ).click();
  }

  click_add_post_btn() {
    cy.get(CategoryLocators.addPostBtn).click();
  }

  open_survey_with_categories() {
    cy.get(CategoryLocators.categoryTestSurvey).click();
  }

  open_settings() {
    cy.get(CategoryLocators.stngsBtn).click();
  }

  open_surveys() {
    cy.get(CategoryLocators.surveyBtn).click();
  }

  add_survey() {
    cy.get(CategoryLocators.addSurveyBtn).click();
  }

  type_post_title(title) {
    cy.get(CategoryLocators.postTitleField).should('be.visible').type(title, { force: true });
  }

  type_post_description(description) {
    cy.get(CategoryLocators.postDescField).type(description, { force: true });
  }

  save_post() {
    cy.get(CategoryLocators.savePostBtn).click();
  }

  create_survey_with_category() {
    this.open_settings();
    this.open_surveys();
    this.add_survey();
    cy.get(CategoryLocators.surveyNameField).type('Survey title with categories');
    cy.get(CategoryLocators.surveyDescriptionField).type('Survey description with categories');
    cy.get(CategoryLocators.addNewFieldBtn).click();
    // cy.get(CategoryLocators.selectCategoryField).click({ force: true });
    cy.get(CategoryLocators.addNewFieldModal).find(CategoryLocators.selectCategoryField).click();
    cy.get(CategoryLocators.saveFieldBtn).click();
  }

  add_post_to_category() {
    this.click_add_post_btn();
    this.open_survey_with_categories();
    cy.wait(1000);
    this.type_post_title('New Post Title');
    this.type_post_description('New Post Description');
    cy.get('mat-checkbox-214-input').click();
    this.save_post();
    cy.get(CategoryLocators.successBtn).click();
  }

  verify_visibility_matches_parent() {
    cy.wait(1000);
    cy.get(CategoryLocators.selectParentCtgry).click();
    cy.get(`[data-qa="${getUniqueSelector(this.uniqueParentCtgry)}"]`).should(
      'have.attr',
      'aria-selected',
      'true',
    );
  }

  verify_created_category_exists() {
    cy.contains(this.uniqueParentCtgry).should('exist');
  }
}

export default CategoryFunctions;
