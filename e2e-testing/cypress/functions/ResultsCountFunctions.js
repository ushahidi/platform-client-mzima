import ResultsCountLocators from '../locators/ResultsCountLocators';

class ResultsCountFunctions {
    visit_page(url) {
        cy.visit(url);
    }
    click_data_view_btn(){
        cy.get(ResultsCountLocators.dataViewBtn).click()
    }

    verify_results_count_on_data_view(){
        cy.get(ResultsCountLocators.postResultsCount)
          .contains('Results: 0').should('exist');
        cy.get(ResultsCountLocators.surveySelectionList)
        .children(ResultsCountLocators.surveySelectItem)
        .eq(0)
        .click({force: true})
        cy.get(ResultsCountLocators.postPreview)
        .children(ResultsCountLocators.postItem)
        .then(($el) => {
            cy.get(ResultsCountLocators.postResultsCount)
            .contains($el.length).should('exist');
        })

    }

    visit_landing_page() {
        this.visit_page(Cypress.env('baseUrl'));
    }
}

export default ResultsCountFunctions;
