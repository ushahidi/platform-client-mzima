/// <reference types="Cypress" />

import CategoryLocators from '../locators/CategoryLocator';

class CategoryFunctions {
  open_category_creation_page_steps() {
    cy.get(CategoryLocators.stngsBtn).click();
    cy.get(CategoryLocators.ctgryBtn).click();
    cy.get(CategoryLocators.addCategoryBtn).click();
  }

  add_category_details_steps() {
    const uniqueName = `Automated Category-${Math.floor(Math.random() * 900) + 100}`;
    cy.get(CategoryLocators.ctgryNameField).type(uniqueName);
    cy.get(CategoryLocators.ctgryDescField).type('Automated Description');
    cy.get('mat-radio-group.radio-buttons').find('input[value="everyone"]').should('be.checked');
  }

  complete_add_category_steps() {
    cy.get(CategoryLocators.saveCtgryBtn).click();
  }

  verify_created_category_exists() {
    cy.contains('Automated Category').should('exist');
  }
}

export default CategoryFunctions;
