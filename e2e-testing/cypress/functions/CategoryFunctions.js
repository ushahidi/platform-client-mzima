/// <reference types="Cypress" />

import CategoryLocators, { getUniqueSelector } from '../locators/CategoryLocators';

class CategoryFunctions {
  constructor() {
    this.uniqueParentCtgry = `Automated Parent Category-${Math.floor(Math.random() * 900) + 100}`;
    this.uniqueChildCtgry = `Automated Child Category-${Math.floor(Math.random() * 900) + 100}`;
  }

  open_category_list_page() {
    cy.get(CategoryLocators.stngsBtn).scrollIntoView().click();
    cy.get(CategoryLocators.ctgryBtn).click();
    cy.url().should('include', '/settings/categories');
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

  delete_category_bulk_actions(category_id) {
    //click bulk actions
    cy.get(CategoryLocators.blkActionsBtn).click();
    cy.get(CategoryLocators.deleteBtn).should('be.visible');
    //click on checkbox
    cy.get(category_id).scrollIntoView().should('be.visible').click();
    //click delete
    cy.get(CategoryLocators.deleteBtn).click();
    //confirm delete
    cy.get(CategoryLocators.confirmdeleteBtn).click();

    //dismiss confirmation toast
    cy.get('.mat-snack-bar-container').should('be.visible');
    //modify this check to accomodate both single category and multiple categories deleted
    // cy.contains('deleted').should('be.visible');
    cy.contains('Close').click();
  }

  verify_child_category_deleted(child_category_deleted) {
    //verify category no longer exists
    cy.contains(child_category_deleted).should('not.exist');

    //navigate to data view and verify deleted category does not exist under filters
    cy.get(CategoryLocators.dataViewBtn).click();
    cy.get('[data-qa="search-form__filters"]').click();

    cy.get(CategoryLocators.categoryFilterBtn).should('be.visible').click();
    cy.contains(child_category_deleted).should('not.exist');
  }

  verify_parent_category_deleted() {
    cy.contains('New Parent A').should('not.exist');
    //verify child also does not exist
    cy.contains('Children A').should('not.exist');

    //navigate to data view and verify deleted category does not exist under filters
    cy.get(CategoryLocators.dataViewBtn).click();
    cy.get('[data-qa="search-form__filters"]').click();

    cy.get(CategoryLocators.categoryFilterBtn).click();
    cy.contains('New Parent A').should('not.exist');
    //verify child also does not exist
    cy.contains('Children A').should('not.exist');
  }

  delete_category_details_page() {
    //click category to open details page
    cy.get('category name').click();
    //click delete to delete category
    cy.get(CategoryLocators.categoryDeleteBtn).click();
    //confirm deletion
    cy.get(CategoryLocators.categoryDeleteBtn).click();
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
