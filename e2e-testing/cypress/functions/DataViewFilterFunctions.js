import DataViewLocators from '../locators/DataViewLocators';

import LoginFunctions from '../functions/LoginFunctions';
import CollectionLocators from '../locators/CollectionLocators';

const loginFunctions = new LoginFunctions();

class DataViewFilterFunctions {
  click_data_view_btn() {
    cy.get(DataViewLocators.dataViewBtn).click();
    cy.url().should('include', '/feed');
  }

  check_post_filter_by_survey() {
    cy.get(DataViewLocators.postPreview).children(DataViewLocators.postItem).should('not.be.empty');
  }

  click_add_post_btn() {
    cy.get(DataViewLocators.addPostBtn).click();
  }

  open_survey_to_submit() {
    cy.get(DataViewLocators.surveyToSubmitPost).click();
  }

  type_post_title(title) {
    cy.get(DataViewLocators.postTitleField).should('be.visible');
    cy.get(DataViewLocators.postTitleField).type(title);
  }

  type_post_description(description) {
    cy.get(DataViewLocators.postDescField).should('be.visible');
    cy.get(DataViewLocators.postDescField).type(description);
  }

  save_post() {
    cy.get(DataViewLocators.savePostBtn).click();
  }

  add_post() {
    this.click_add_post_btn();
    this.open_survey_to_submit();
    cy.wait(1000);
    this.type_post_title('New Post Title');
    this.type_post_description('New Post Description');
    this.save_post();
    cy.get(DataViewLocators.successBtn).click();
  }

  verify_count_on_results() {
    //verify results on landing on Data view
    cy.get(DataViewLocators.mainResultsTotal).contains('Results: 512');
    cy.get(DataViewLocators.feedPageResults).contains('Current results: 20 / 512');

    //clear all selected surveys
    cy.get(DataViewLocators.clearBtn).click();
    cy.get(DataViewLocators.mainResultsTotal).contains('Results: 0');
    //select only first survey
    cy.get('[data-qa="survey-select-item2"]').click();
    //verify count
    cy.get(DataViewLocators.mainResultsTotal).contains('Results: 8');

    //select second survey
    cy.get('[data-qa="survey-select-item3"]').click();
    cy.get(DataViewLocators.mainResultsTotal).contains('Results: 11');

    //select third survey
    cy.get('[data-qa="survey-select-item4"]').click();
    cy.get(DataViewLocators.mainResultsTotal).contains('Results: 21');
    cy.get(DataViewLocators.feedPageResults).contains('Current results: 20 / 21');

    //reveal filters button
    cy.get(DataViewLocators.revealFiltersBtn).click();
    //click clear all filters button
    cy.get(DataViewLocators.clearFiltersBtn).click();
    cy.get(DataViewLocators.mainResultsTotal).contains('Results: 512');
    cy.get(DataViewLocators.feedPageResults).contains('Current results: 20 / 512');
  }

  delete_post_data_view() {
    this.add_post();
    this.click_data_view_btn();
    //check post appears for admin user
    cy.get(DataViewLocators.postPreview)
      .children(DataViewLocators.postItem)
      .contains('New Post Title')
      .click();
    cy.get(DataViewLocators.postMenuDots).eq(1).click();
    cy.get(DataViewLocators.deletePostBtn).click();
    cy.get('#confirm-modal').click();
    cy.get(DataViewLocators.deleteConfirmBtn).click();
    cy.get(DataViewLocators.successBtn).click();
    cy.get(DataViewLocators.postPreview)
      .children(DataViewLocators.postItem)
      .contains('New Post Title')
      .should('not.exist');
  }

  check_post_filter_by_status() {
    //click search form filter button
    cy.get(DataViewLocators.revealFiltersBtn).click();
    cy.get(DataViewLocators.feedPageResults).contains('Current results: 20 / 512');
    //click status filter button
    // cy.get(DataViewLocators.statusBtn).click();
    cy.get('button:contains("Status")').click();
    //check that published option is checked
    cy.get(DataViewLocators.filterSelectionList)
      .find('.mat-list-item-content')
      .eq(0)
      .find('.mat-pseudo-checkbox')
      .invoke('attr', 'class')
      .should('contain', 'mat-pseudo-checkbox-checked');
    //check that under review option is checked
    cy.get(DataViewLocators.filterSelectionList)
      .children(DataViewLocators.filterListOption)
      .eq(1)
      .find('.mat-pseudo-checkbox')
      .invoke('attr', 'class')
      .should('contain', 'mat-pseudo-checkbox-checked');
    //check that archived option is unchecked
    cy.get(DataViewLocators.filterSelectionList)
      .children(DataViewLocators.filterListOption)
      .eq(2)
      .find('.mat-pseudo-checkbox')
      .invoke('attr', 'class')
      .should('not.contain', 'mat-pseudo-checkbox-checked');
    //select the archived option
    cy.get(DataViewLocators.filterSelectionList)
      .children(DataViewLocators.filterListOption)
      .eq(2)
      .find('.mat-pseudo-checkbox')
      .click();
    cy.get(DataViewLocators.feedPageResults).contains('Current results: 20 / 600');
    //unselect archived and under review options
    cy.get(DataViewLocators.filterSelectionList)
      .children(DataViewLocators.filterListOption)
      .eq(1)
      .find('.mat-pseudo-checkbox')
      .click();
    cy.get(DataViewLocators.filterSelectionList)
      .children(DataViewLocators.filterListOption)
      .eq(2)
      .find('.mat-pseudo-checkbox')
      .click();
    //check that only published is selected
    cy.get(DataViewLocators.filterSelectionList)
      .find('.mat-list-item-content')
      .eq(0)
      .find('.mat-pseudo-checkbox')
      .invoke('attr', 'class')
      .should('contain', 'mat-pseudo-checkbox-checked');
    cy.get(DataViewLocators.feedPageResults).contains('Current results: 20 / 74');
    //unselect published and select under review option
    cy.get(DataViewLocators.filterSelectionList)
      .children(DataViewLocators.filterListOption)
      .eq(0)
      .find('.mat-pseudo-checkbox')
      .click();
    cy.get(DataViewLocators.filterSelectionList)
      .children(DataViewLocators.filterListOption)
      .eq(1)
      .find('.mat-pseudo-checkbox')
      .click();
    //check that only under review is selected
    cy.get(DataViewLocators.filterSelectionList)
      .children(DataViewLocators.filterListOption)
      .eq(1)
      .find('.mat-pseudo-checkbox')
      .invoke('attr', 'class')
      .should('contain', 'mat-pseudo-checkbox-checked');
    cy.get(DataViewLocators.feedPageResults).contains('Current results: 20 / 438');

    //reload the page since an overlay at this point prevents element from being accessed
    //not clean implementation, but lets see if it unblocks the tests
    cy.reload();
    //clear all filters
    cy.get(DataViewLocators.clearFiltersBtn).click();
    //verify that published and under review are selected
    cy.get(DataViewLocators.statusBtn).click();
    cy.get(DataViewLocators.filterSelectionList)
      .find('.mat-list-item-content')
      .eq(0)
      .find('.mat-pseudo-checkbox')
      .invoke('attr', 'class')
      .should('contain', 'mat-pseudo-checkbox-checked');
    cy.get(DataViewLocators.filterSelectionList)
      .children(DataViewLocators.filterListOption)
      .eq(1)
      .find('.mat-pseudo-checkbox')
      .invoke('attr', 'class')
      .should('contain', 'mat-pseudo-checkbox-checked');
    cy.get(DataViewLocators.feedPageResults).contains('Current results: 20 / 512');
  }
}

export default DataViewFilterFunctions;
