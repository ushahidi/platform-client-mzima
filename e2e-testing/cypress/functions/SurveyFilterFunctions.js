import DataViewLocators from '../locators/DataViewLocators';
class SurveyFilterFunctions {
    click_data_view_btn(){
        cy.get(DataViewLocators.dataViewBtn).click();
    }

    check_post_filter_by_survey(){
        cy.get(DataViewLocators.posts)
        .contains('There are no posts yet!').should('exist');
        cy.get(DataViewLocators.postPreview)
        .children(DataViewLocators.postItem)
        .should('not.be.empty');
    }

    verify_count_on_results(){
        cy.get(DataViewLocators.searchFormMainFiltersTotal)
          .contains("Results: 513");
        cy.get(DataViewLocators.feedPageResults)
          .contains("Current results: 20 / 513")
        cy.get(DataViewLocators.clearBtn).click();
        cy.get(DataViewLocators.searchFormMainFiltersTotal)
          .contains("Results: 0");
        cy.get(DataViewLocators.surveySelectionList)
          .children(DataViewLocators.surveySelectItem)
          .eq(0)
          .click();
        cy.get(DataViewLocators.searchFormMainFiltersTotal)
          .contains("Results: 9");
        cy.get(DataViewLocators.surveySelectionList)
          .children(DataViewLocators.surveySelectItem)
          .eq(1)
          .click();
        cy.get(DataViewLocators.searchFormMainFiltersTotal)
          .contains("Results: 12");
          cy.get(DataViewLocators.surveySelectionList)
          .children(DataViewLocators.surveySelectItem)
          .eq(2)
          .click();
        cy.get(DataViewLocators.searchFormMainFiltersTotal)
          .contains("Results: 22");
        cy.get(DataViewLocators.feedPageResults)
          .contains("Current results: 20 / 22")
        cy.get(DataViewLocators.searchFormFiltersBtn).click();
        cy.get(DataViewLocators.searchFormButton).click();
        cy.get(DataViewLocators.searchFormMainFiltersTotal)
          .contains("Results: 165");
        cy.get(DataViewLocators.feedPageResults)
          .contains("Current results: 20 / 165");
    }
}

export default SurveyFilterFunctions;