import DataViewLocators from '../locators/DataViewLocators';

class ResultsCountFunctions {
    visit_landing_page() {
        cy.visit(Cypress.env('baseUrl'));
    }

    click_data_view_btn(){
        cy.get(DataViewLocators.dataViewBtn).click()
    }

    verify_results_count_on_data_view(){
        cy.get(DataViewLocators.postResultsCount)
          .contains('Results: 0').should('exist');
        cy.get(DataViewLocators.surveySelectionList)
        .children(DataViewLocators.surveySelectItem)
        .eq(0)
        .click({force: true})
        cy.get(DataViewLocators.postPreview)
        .children(DataViewLocators.postItem)
        .then(($el) => {
            cy.get(DataViewLocators.postResultsCount)
            .contains($el.length).should('exist');
        })
    }
}

export default ResultsCountFunctions;