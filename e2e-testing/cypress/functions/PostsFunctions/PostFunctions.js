/// <reference types="Cypress" />

import PostLocators from '../../locators/PostsLocators/PostLocators';

class PostFunctions {
  constructor() {
    this.postTitle = `Automated Title Response-${Math.floor(Math.random() * 900) + 100}`;
    this.postDescription = 'Automated Description Response';
  }
  open_post_creation_form() {
    cy.get(PostLocators.addPostBtn).click();
    cy.get(PostLocators.srvyItemBtn).click();
  }

  type_post_title(title) {
    cy.get(PostLocators.titleField).eq(0).type(title).should('have.value', title);
  }

  type_post_description(description) {
    cy.get(PostLocators.descField).type(description).should('have.value', description);
  }

  fill_required_form_fields() {
    this.type_post_title(this.postTitle);
    this.type_post_description(this.postDescription);
    cy.get(PostLocators.lngTextField).type('This is an automated long text response');
    cy.get(PostLocators.shtTextField).type('Automated Short text');
    cy.get(PostLocators.decimalField).type(99.9);
    cy.get(PostLocators.intField).type(100);

    //type in nairobi county in full. this gets one result and picks it automatically, populating lat and long fields
    cy.get(PostLocators.locationSearchField).type('nairobi county');
    //verify values in lat and long fields
    cy.get(PostLocators.locationLatField).should('have.value', '-1.3026148499999999');
    cy.get(PostLocators.locationLongField).should('have.value', '36.82884201813725');

    // click on date field to open pop up
    // cy.get(PostLocators.dateField).click(); //the first click opens the date picker
    // cy.get(PostLocators.dateField).click(); //the second click closes the date picker
    //add a check that the field is populated with the current day's date
    //skipping this because it has no value as a test, will add date-specific checks

    // cy.get('.mat-button.mat-stroked-button').click(); // click on the checkmark button to select today's date
    //this works for date&time field, not date only field. date only field has no checkmark
    cy.get(PostLocators.selectFieldBtn).click();
    cy.get(PostLocators.selectFieldOption1).click();
    cy.get(PostLocators.radioFieldOption2).click();
    cy.get(PostLocators.checkboxFieldOption3).click();
  }

  complete_add_post_steps() {
    cy.get(PostLocators.submitBtn).should('not.be.disabled');
    cy.get(PostLocators.submitBtn).click();
    cy.get(PostLocators.successButton).click();
  }

  verify_created_post_exists() {
    // cy.get(PostLocators.surveySelectionList)
    // .children(PostLocators.surveySelectItem)
    // .contains("Full Length Survey-with image-field- don't delete")
    // .click({ force: true });
    cy.get(PostLocators.postPreview)
      .children(PostLocators.postItem)
      .contains(this.postTitle)
      .should('be.visible');
  }

  open_post_for_details() {
    cy.get(PostLocators.dataViewBtn).click();
    cy.get(PostLocators.postItem).eq(0).click();
  }

  verify_post_details() {
    //verify survey name is shown
    cy.contains("Full Length Survey-with image-field- don't delete")
      .scrollIntoView()
      .should('be.visible');
    //verify survey fields
    cy.get(PostLocators.titleValue).should('contain', 'Automated Title Response');
    cy.get(PostLocators.descriptionValue).should('contain', 'Automated Description Response');
    cy.contains('Automated Short text').scrollIntoView().should('be.visible');
    cy.contains('This is an automated long text response').should('be.visible');
    cy.contains(99.9).should('be.visible');
    cy.contains(100).should('be.visible');
    cy.contains('S1').scrollIntoView().should('be.visible');
    cy.contains('R2').scrollIntoView().should('be.visible');
    cy.contains('F3').scrollIntoView().should('be.visible');
  }
}

export default PostFunctions;
