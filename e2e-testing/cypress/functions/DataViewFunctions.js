/// <reference types="Cypress" />

import DataViewLocators from '../locators/DataViewLocators';

class DataViewFunctions {
  constructor() {
    this.simplePost1 = `Automated Title Response-${Math.floor(Math.random() * 9000) + 1000}`;
    this.simplePost2 = `Automated Title Response-${Math.floor(Math.random() * 9000) + 1000}`;
    this.postDescription = 'Automated Description Response';
  }

  open_user_data_view_page() {
    cy.wait(2000);
    cy.get(DataViewLocators.dataViewBtn).click();
    cy.contains('button', 'Clear').click();
    cy.wait(1000);
    cy.contains('mat-list-option', "A Simple survey - don't delete ")
      .find('.mat-pseudo-checkbox')
      .click();
  }

  create_simple_post(title, description) {
    cy.get(DataViewLocators.addNewPostBtn).click();
    cy.get(DataViewLocators.srvyItemBtn).click(); /* simple survey form button */
    cy.contains('mat-label', 'Title')
      .siblings('mat-form-field')
      .find('input.mat-input-element')
      .type(title);
    cy.get(DataViewLocators.descField).type(description);
    cy.get(DataViewLocators.submitBtn).click();
    cy.get(DataViewLocators.successButton).click();
  }

  edit_simple_post(post) {
    cy.contains('app-post-preview', post).within(() => {
      cy.get(DataViewLocators.editPostBtn).click();
    });
    cy.get(DataViewLocators.descField).clear().type('This automated post has been edited');
    cy.get(DataViewLocators.submitBtn).click();
  }

  delete_simple_post(post) {
    cy.contains('app-post-preview', post).within(() => {
      cy.get(DataViewLocators.postActionsBtn).click();
    });
    cy.get(DataViewLocators.deletePostBtn).click();
    cy.get(DataViewLocators.confirmDeletePostBtn).click();
    cy.get(DataViewLocators.successButton).click();
  }

  get_user_display_name() {
    let display_name = '';
    cy.get(DataViewLocators.accountInfoBtn).click();
    cy.get(DataViewLocators.accountStnsBtn).click();
    cy.get(DataViewLocators.displayNameField)
      .invoke('val')
      .then((text) => {
        display_name = text;
      });
    cy.get(DataViewLocators.closeDialogBtn).click();
    return display_name;
  }

  create_and_verify_post() {
    this.open_user_data_view_page();
    this.create_simple_post(this.simplePost1, this.postDescription);
    const user = this.get_user_display_name();
    cy.get('app-post-preview')
      .eq(0)
      .within(() => {
        cy.contains('h3', this.simplePost1).should('be.visible');
        cy.contains('p', this.postDescription).should('be.visible');
        cy.get('.post-info__username.ng-star-inserted').should('contain', user);
        cy.get('.post-info__status.post-info__status--draft').should('contain', 'Under review');
      });
    this.delete_simple_post(this.simplePost1);
  }

  create_comparison_posts() {
    this.create_simple_post(this.simplePost1, this.postDescription);
    this.create_simple_post(this.simplePost2, this.postDescription);
  }

  edit_comparison_posts() {
    this.open_user_data_view_page();
    this.edit_simple_post(this.simplePost2);
    cy.wait(1000);
    cy.get('#switcher-button-tiles').click();
    this.edit_simple_post(this.simplePost1);
  }

  delete_comparison_posts() {
    this.open_user_data_view_page();
    this.delete_simple_post(this.simplePost1);
    this.delete_simple_post(this.simplePost2);
  }

  sort_by_date_created_newest_first() {
    this.open_user_data_view_page();
    cy.contains('mzima-client-button', 'Sorting').find('button').click();
    cy.contains('button', 'Date created (Newest first)').click();
    // verify simplePost2 comes before simplePost1
    cy.get('ngx-masonry').within(() => {
      cy.get('.post__content h3').then(($posts) => {
        const posts = $posts.map((_, el) => Cypress.$(el).text()).get();
        const simplePost1Idx = posts.indexOf(this.simplePost1);
        const simplePost2Idx = posts.indexOf(this.simplePost2);
        expect(simplePost1Idx).to.be.greaterThan(simplePost2Idx);
      });
    });
  }

  sort_by_date_created_oldest_first() {
    this.open_user_data_view_page();
    cy.contains('mzima-client-button', 'Sorting').find('button').click();
    cy.contains('button', 'Date created (Oldest first)').click();
    // go to last page
    cy.get('ul.ngx-pagination li.pagination-next').prev().click();
    // verify simplePost1 comes before simplePost2
    cy.get('ngx-masonry').within(() => {
      cy.get('.post__content h3').then(($posts) => {
        const posts = $posts.map((_, el) => Cypress.$(el).text()).get();
        const simplePost1Idx = posts.indexOf(this.simplePost1);
        const simplePost2Idx = posts.indexOf(this.simplePost2);
        expect(simplePost1Idx).to.be.lessThan(simplePost2Idx);
      });
    });
  }

  sort_by_date_updated_newest_first() {
    this.open_user_data_view_page();
    cy.contains('mzima-client-button', 'Sorting').find('button').click();
    cy.contains('button', 'Date updated (Newest first)').click();
    // verify simplePost1 comes before simplePost2
    cy.get('ngx-masonry').within(() => {
      cy.get('.post__content h3').then(($posts) => {
        const posts = $posts.map((_, el) => Cypress.$(el).text()).get();
        const simplePost1Idx = posts.indexOf(this.simplePost1);
        const simplePost2Idx = posts.indexOf(this.simplePost2);
        expect(simplePost1Idx).to.be.lessThan(simplePost2Idx);
      });
    });
  }

  sort_by_date_updated_oldest_first() {
    this.open_user_data_view_page();
    cy.contains('mzima-client-button', 'Sorting').find('button').click();
    cy.contains('button', 'Date updated (Oldest first)').click();
    // verify simplePost2 comes before simplePost1
    cy.get('ngx-masonry').within(() => {
      cy.get('.post__content h3').then(($posts) => {
        const posts = $posts.map((_, el) => Cypress.$(el).text()).get();
        const simplePost1Idx = posts.indexOf(this.simplePost1);
        const simplePost2Idx = posts.indexOf(this.simplePost2);
        expect(simplePost1Idx).to.be.greaterThan(simplePost2Idx);
      });
    });
  }
}

export default DataViewFunctions;
