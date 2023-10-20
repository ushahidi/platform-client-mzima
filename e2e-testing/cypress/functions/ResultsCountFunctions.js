import ResultsCountLocators from '../locators/ResultsCountLocators';

class ResultsCountFunctions {
    visit_page(url) {
        cy.visit(url);
    }
    click_data_view_btn(){
        cy.get(ResultsCountLocators.dataViewBtn).click()
    }

    verify_results_count_on_data_view(){
        cy.get(".search-form__main-filters__total.ng-star-inserted")
          .contains('Results: 0').should('exist');
        cy.get('mat-selection-list[name="surveys"]')
        .children('mat-list-option')
        .eq(0)
        .click({force: true})
        cy.get('ngx-masonry')
        .children('app-post-preview')
        cy.get(".search-form__main-filters__total.ng-star-inserted")
          .contains('Results: 2').should('exist');

    }

    visit_landing_page() {
        this.visit_page(Cypress.env('baseUrl'));
    }
}

export default ResultsCountFunctions;
