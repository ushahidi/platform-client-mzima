import DataViewLocators from '../locators/DataViewLocators';
class SurveyFilterFunctions {
  click_data_view_btn() {
    cy.get(DataViewLocators.dataViewBtn).click();
  }

  check_post_filter_by_survey() {
    cy.get(DataViewLocators.posts).contains('There are no posts yet!').should('exist');
    cy.get(DataViewLocators.postPreview).children(DataViewLocators.postItem).should('not.be.empty');
  }

  verify_count_on_results() {
    //verify results on landing on Data view
    cy.get(DataViewLocators.mainResultsTotal).contains('Results: 513');
    cy.get(DataViewLocators.feedPageResults).contains('Current results: 20 / 513');

    //clear all selected surveys
    cy.get(DataViewLocators.clearBtn).click();
    cy.get(DataViewLocators.mainResultsTotal).contains('Results: 0');
    //select only first survey
    cy.get(DataViewLocators.surveySelectionList)
      .children(DataViewLocators.surveySelectItem)
      .eq(0)
      .click();
    //verify count
    cy.get(DataViewLocators.mainResultsTotal).contains('Results: 9');

    //select second survey
    cy.get(DataViewLocators.surveySelectionList)
      .children(DataViewLocators.surveySelectItem)
      .eq(1)
      .click();
    cy.get(DataViewLocators.mainResultsTotal).contains('Results: 12');

    //select third survey
    cy.get(DataViewLocators.surveySelectionList)
      .children(DataViewLocators.surveySelectItem)
      .eq(2)
      .click();
    cy.get(DataViewLocators.mainResultsTotal).contains('Results: 22');
    cy.get(DataViewLocators.feedPageResults).contains('Current results: 20 / 22');

    //reveal filters button
    cy.get(DataViewLocators.revealFiltersBtn).click();
    //click clear all filters button
    cy.get(DataViewLocators.clearFiltersBtn).click();
    cy.get(DataViewLocators.mainResultsTotal).contains('Results: 165');
    cy.get(DataViewLocators.feedPageResults).contains('Current results: 20 / 165');
  }
}

export default SurveyFilterFunctions;
