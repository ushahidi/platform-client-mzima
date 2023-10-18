import ResultsCountLocators from '../locators/ResultsCountLocators';

class ResultsCountFunctions {
    visit_page(url) {
            cy.visit(url);
    }
    click_data_view_btn(){
        cy.get(ResultsCountLocators.dataViewBtn).click()
    }

    visit_landing_page() {
        this.visit_page(Cypress.env('baseUrl'));
    }

}

export default ResultsCountFunctions;
