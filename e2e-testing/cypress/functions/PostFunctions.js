/// <reference types="Cypress" />

import PostLocators from '../locators/PostLocators';

class PostFunctions {
  constructor() {
    this.postTitle = 'Automated Title Response';
    this.postDescription = 'Automated Description Response';
  }
  open_post_creation_form() {
    cy.get('.sidebar__add-post-btn .submit-post-button .mzima-button--primary').click();
    cy.get(PostLocators.srvyItemBtn).click();
  }

  fill_required_form_fields() {
    cy.get('mat-form-field.mat-form-field').find('input.mat-input-element').type(this.postTitle);
    cy.get(PostFunctions.descField).type(this.postDescription);
    cy.get(PostFunctions.lngTextField).type('This is an automated long text response');
    cy.get(PostFunctions.decimalField).type(99.9);
    cy.get(PostFunctions.intField).type(100);
    // click on date field to open pop up
    cy.get(PostFunctions.dateField).click();
    cy.get('.mat-button.mat-stroked-button').click(); // click on the checkmark button to select today's date
    cy.get(PostFunctions.selectFieldBtn).click();
    cy.get(PostFunctions.selectFieldOption1).click();
    cy.get(PostFunctions.radioFieldOption2).click();
    cy.get(PostFunctions.checkboxFieldOption3).click();
    cy.get(PostFunctions.relatedPostField).type(
      'http://localhost:4200/feed/103214/view?page=1&mode=POST',
    );
    cy.get(PostFunctions.intField).type('https://youtu.be/EhT3co2qNAA?si=Z6f5Ao1VHWItT4Fe');
  }

  complete_add_post_steps() {
    cy.get(PostFunctions.submitBtn).click();
    cy.get('div.confirm-content').should('be.visible');
    cy.get(PostFunctions.successButton).click();
  }

  verify_created_post_exists() {
    cy.contains(this.postTitle).should('exist');
  }
}

export default PostFunctions;
