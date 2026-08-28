/// <reference types="Cypress" />

import DataViewLocators from '../../locators/DataViewLocators';
import LoginFunctions from '../LoginFunctions';
import PostLocators from '../../locators/PostsLocators/PostLocators';

const loginFunctions = new LoginFunctions();

class DataViewFunctions {
  constructor() {
    this.postTitle = `The elections`;
    this.postDescription = 'This is a post about the ongoing elections';
  }
  open_post_creation_form() {
    cy.get(PostLocators.addPostBtn).click();
    cy.get(PostLocators.srvyItemBtn2).click();
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
  }

  complete_add_post_steps() {
    cy.get(PostLocators.submitBtn).should('not.be.disabled');
    cy.get(PostLocators.submitBtn).click();
    cy.get(PostLocators.successButton).click();
  }

  click_data_view_btn() {
    cy.get(DataViewLocators.dataViewBtn).should('be.visible').click({ force: true });
    cy.url().should('include', '/feed');
  }
  search_and_verify_results(keyword) {
    this.open_post_creation_form();
    this.fill_required_form_fields();
    this.complete_add_post_steps();
    this.click_data_view_btn();
    cy.get(DataViewLocators.searchInput).clear({ force: true }).type(keyword, { force: true });
    // Wait for the API request to fetch results
    cy.intercept('GET', '**/api/v5/posts/stats*').as('searchResults');
    cy.wait('@searchResults');
    // Verify that results contain the keyword in the title or description
    cy.get(DataViewLocators.postPreview).within(() => {
      cy.get(DataViewLocators.postItem).each(($post) => {
        cy.wrap($post)
          .invoke('text')
          .then((text) => {
            expect(text.toLowerCase()).to.include(keyword.toLowerCase());
          });
      });
    });
  }
  search_and_verify_results_with_special_characters(keyword) {
    this.click_data_view_btn();
    cy.get(DataViewLocators.searchInput).clear({ force: true }).type(keyword, { force: true });
    cy.get(DataViewLocators.postsEmptyMessage)
      .should('be.visible')
      .and('contain.text', 'No posts match your keyword search');
  }
}

export default DataViewFunctions;
