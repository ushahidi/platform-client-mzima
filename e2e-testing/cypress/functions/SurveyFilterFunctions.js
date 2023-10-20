import SurveyFilterLocators from '../locators/SurveyFilterLocators';
class SurveyFilterFunctions {
    click_data_view_btn(){
        cy.get(SurveyFilterLocators.dataViewBtn).click()
    }

    check_post_filter_by_survey(){
        cy.get('.feed-page__main')
        .contains('There are no posts yet!').should('exist');
        cy.get('mat-selection-list[name="surveys"]')
        .children('mat-list-option')
        .eq(0)
        .click({force: true})
        cy.get('ngx-masonry')
        .children('app-post-preview')
        .should('not.be.empty');

    }
}

export default SurveyFilterFunctions;