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
    cy.get(DataViewLocators.clearSrvyFiltersBtn).click();
    cy.wait(1000);
    cy.get(DataViewLocators.srvyFilterBtn).click();
  }

  create_simple_post(title, description) {
    cy.get(DataViewLocators.addNewPostBtn).click();
    cy.get(DataViewLocators.srvyItemBtn).click();
    cy.contains('mat-label', 'Title')
      .siblings('mat-form-field')
      .find('input.mat-input-element')
      .type(title);
    cy.get(DataViewLocators.descField).type(description);
    cy.get(DataViewLocators.submitBtn).click();
    cy.get(DataViewLocators.successButton).click();
  }

  edit_simple_post(post) {
    cy.contains(DataViewLocators.postPreview, post).within(() => {
      cy.get(DataViewLocators.editPostBtn).click();
    });
    cy.get(DataViewLocators.descField).clear().type('This automated post has been edited');
    cy.get(DataViewLocators.submitBtn).click();
  }

  delete_simple_post(post) {
    cy.contains(DataViewLocators.postPreview, post).within(() => {
      cy.get(DataViewLocators.postActionsBtn).click();
    });
    cy.get(DataViewLocators.deletePostBtn).click();
    cy.get(DataViewLocators.confirmDeletePostBtn).click();
    cy.get(DataViewLocators.successButton).click();
  }

  create_comparison_posts() {
    this.create_simple_post(this.simplePost1, this.postDescription);
    this.create_simple_post(this.simplePost2, this.postDescription);
  }

  edit_comparison_posts() {
    this.open_user_data_view_page();
    this.edit_simple_post(this.simplePost2);
    cy.wait(1000);
    cy.get(DataViewLocators.tileViewBtn).click();
    this.edit_simple_post(this.simplePost1);
  }

  delete_comparison_posts() {
    this.open_user_data_view_page();
    this.delete_simple_post(this.simplePost1);
    cy.wait(1000);
    this.delete_simple_post(this.simplePost2);
  }

  sort_by_date_created_newest_first() {
    this.open_user_data_view_page();
    cy.get(DataViewLocators.sortingBtn).click();
    cy.get(DataViewLocators.createAtNewFirst).click();

    // verify simplePost2 comes before simplePost1
    cy.get(DataViewLocators.feedPosts).within(() => {
      cy.get(DataViewLocators.postTitle).then(($postTitles) => {
        const postTitles = $postTitles.map((_, el) => Cypress.$(el).text()).get();
        const simplePost1Idx = postTitles.indexOf(this.simplePost1);
        const simplePost2Idx = postTitles.indexOf(this.simplePost2);
        expect(simplePost1Idx).to.be.greaterThan(simplePost2Idx);
      });
    });
  }

  sort_by_date_created_oldest_first() {
    this.open_user_data_view_page();
    cy.get(DataViewLocators.sortingBtn).click();
    cy.get(DataViewLocators.createdAtOldestFirst).click();

    // go to last page
    cy.get('ul.ngx-pagination li.pagination-next').prev().click();
    // verify simplePost1 comes before simplePost2
    cy.get(DataViewLocators.feedPosts).within(() => {
      cy.get(DataViewLocators.postTitle).then(($postTitles) => {
        const postTitles = $postTitles.map((_, el) => Cypress.$(el).text()).get();
        const simplePost1Idx = postTitles.indexOf(this.simplePost1);
        const simplePost2Idx = postTitles.indexOf(this.simplePost2);
        expect(simplePost1Idx).to.be.lessThan(simplePost2Idx);
      });
    });
  }

  // Edit posts and sort
  sort_by_date_updated_newest_first() {
    this.open_user_data_view_page();
    cy.get(DataViewLocators.sortingBtn).click();
    cy.get(DataViewLocators.updatedAtNewFirst).click();

    // verify simplePost1 comes before simplePost2
    cy.get(DataViewLocators.feedPosts).within(() => {
      cy.get(DataViewLocators.postTitle).then(($postTitles) => {
        const postTitles = $postTitles.map((_, el) => Cypress.$(el).text()).get();
        const simplePost1Idx = postTitles.indexOf(this.simplePost1);
        const simplePost2Idx = postTitles.indexOf(this.simplePost2);
        expect(simplePost1Idx).to.be.lessThan(simplePost2Idx);
      });
    });
  }

  sort_by_date_updated_oldest_first() {
    this.open_user_data_view_page();
    cy.get(DataViewLocators.sortingBtn).click();
    cy.get(DataViewLocators.updatedAtOldestFirst).click();

    // verify simplePost2 comes before simplePost1
    cy.get(DataViewLocators.feedPosts).within(() => {
      cy.get(DataViewLocators.postTitle).then(($postTitles) => {
        const postTitles = $postTitles.map((_, el) => Cypress.$(el).text()).get();
        const simplePost1Idx = postTitles.indexOf(this.simplePost1);
        const simplePost2Idx = postTitles.indexOf(this.simplePost2);
        expect(simplePost1Idx).to.be.greaterThan(simplePost2Idx);
      });
    });
  }
}

export default DataViewFunctions;
