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
    cy.get(CategoryLocators.everyoneRadio).should('be.checked');
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
