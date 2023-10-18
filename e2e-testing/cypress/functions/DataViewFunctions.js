/// <reference types="Cypress" />

import DataViewLocators from '../locators/DataViewLocators';

class DataViewFunctions {
  constructor() {
    this.simplePost1 = `Automated Title Response-${Math.floor(Math.random() * 9000) + 1000}`;
    this.simplePost2 = `Automated Title Response-${Math.floor(Math.random() * 9000) + 1000}`;
    this.postDescription = 'Automated Description Response';
  }

  create_simple_post(title, description) {
    cy.get('.sidebar__add-post-btn .submit-post-button .mzima-button--primary').click();
    cy.get(DataViewLocators.srvyItemBtn).click(); /* simple survey form button */
    cy.contains('mat-label', 'Title')
      .siblings('mat-form-field')
      .find('input.mat-input-element')
      .type(title);
    cy.get(DataViewLocators.descField).type(description);
    cy.get(DataViewLocators.submitBtn).click();
    cy.get(DataViewLocators.successButton).click();
  }

  create_comparison_posts() {
    this.create_simple_post(this.simplePost1, this.postDescription);
    this.create_simple_post(this.simplePost2, this.postDescription);
  }

  sort_by_date_created_newest_first() {
    cy.get(DataViewLocators.dataViewBtn).click();
    cy.contains('button', 'Clear').click();
    cy.wait(1500);
    cy.contains('mat-list-option', "A Simple survey - don't delete ")
      .find('.mat-pseudo-checkbox')
      .click();
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
    cy.get(DataViewLocators.dataViewBtn).click();
    cy.contains('button', 'Clear').click();
    cy.wait(1500);
    cy.contains('mat-list-option', "A Simple survey - don't delete ")
      .find('.mat-pseudo-checkbox')
      .click();
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
}

export default DataViewFunctions;
