import DataViewLocators from '../../locators/DataViewLocators';
import LoginFunctions from '../LoginFunctions';

const loginFunctions = new LoginFunctions();

class DataViewFilterFunctions {
  click_data_view_btn() {
    cy.get(DataViewLocators.dataViewBtn).click();
    cy.url().should('include', '/feed');
  }

  check_post_filter_by_survey() {
    cy.get(DataViewLocators.postPreview).children(DataViewLocators.postItem).should('not.be.empty');
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

  check_post_filter_by_categories() {
    //click search form filter button
    cy.get(DataViewLocators.revealFiltersBtn).click();
    //click categories filter button
    cy.get('button:contains("Categories")').click();
    //check that drop-down on a parent and children are seen
    cy.get('.mat-tree-node').eq(0).find('.multilevelselect-filter__option__arrow').click();
    cy.get('.mat-tree-node').eq(0).should('exist');
    cy.get(`[aria-level="2"]`).should('exist');
    //check that when parent elements are selected children elements are also selected
    cy.get('.mat-tree-node')
      .eq(0)
      .find('.mat-checkbox-input')
      .check({ force: true })
      .should('be.selected');
    cy.get(`[aria-level="2"]`).should('be.selected');
    //verify count shows how many categories are selected
    cy.get(DataViewLocators.selectedFilterCount).contains('3');
    //verify count of posts is updated correctly
    cy.get(DataViewLocators.feedPageResults).contains('Current results: 3 / 512');
  }
}

export default DataViewFilterFunctions;
