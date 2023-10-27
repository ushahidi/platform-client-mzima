/// <reference types="Cypress" />

import PostLocators from '../locators/PostLocators';

class PostFunctions {
  constructor() {
    this.postTitle = `Automated Title Response-${Math.floor(Math.random() * 900) + 100}`;
    this.postDescription = 'Automated Description Response';
  }
  open_post_creation_form() {
    cy.get('.sidebar__add-post-btn .add-web-post-button .mzima-button--primary').click();
    cy.get(PostLocators.srvyItemBtn).click();
  }

  fill_required_form_fields() {
    cy.contains('mat-label', 'Title')
      .siblings('mat-form-field')
      .find('input.mat-input-element')
      .type(this.postTitle);
    cy.get(PostLocators.descField).type(this.postDescription);

    cy.get(PostLocators.lngTextField).type('This is an automated long text response');
    cy.contains('mat-label', 'Number (Decimal) Field')
      .siblings('mat-form-field')
      .find('input.mat-input-element')
      .type(99.9);
    cy.contains('mat-label', 'Number (Integer) Field')
      .siblings('mat-form-field')
      .find('input.mat-input-element')
      .type(100);
    // click on date field to open pop up
    cy.contains('mat-label', 'Date & Time Field')
      .siblings('mat-form-field')
      .find('input.mat-input-element')
      .click();
    cy.get('.mat-button.mat-stroked-button').click(); // click on the checkmark button to select today's date
    cy.get(PostLocators.selectFieldBtn).click();
    cy.get(PostLocators.selectFieldOption1).click();
    cy.get(PostLocators.radioFieldOption2).click();
    cy.get(PostLocators.checkboxFieldOption3).click();
  }

  complete_add_post_steps() {
    cy.get(PostLocators.submitBtn).should('not.be.disabled');
    cy.get(PostLocators.submitBtn).click();
    cy.get('div.confirm-content').should('be.visible');
    cy.get(PostLocators.successButton).click();
  }

  verify_created_post_exists() {
    cy.contains('mat-list-option', "Full Length Survey-with image-field- don't delete")
      .find('.mat-pseudo-checkbox')
      .click();
    cy.contains(this.postTitle).should('exist');
  }
}

export default PostFunctions;
