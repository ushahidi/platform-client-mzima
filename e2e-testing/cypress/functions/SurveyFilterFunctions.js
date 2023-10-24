import SurveyFilterLocators from '../locators/SurveyFilterLocators';
class SurveyFilterFunctions {
    click_data_view_btn(){
        cy.get(SurveyFilterLocators.dataViewBtn).click()
    }

    check_post_filter_by_survey(){
        cy.get(SurveyFilterLocators.posts)
        .contains('There are no posts yet!').should('exist');
        cy.get(SurveyFilterLocators.surveySelectionList)
        .children(SurveyFilterLocators.surveySelectItem)
        .eq(0)
        .click({force: true})
        cy.get(SurveyFilterLocators.postPreview)
        .children(SurveyFilterLocators.postItem)
        .should('not.be.empty');

    }
}

export default SurveyFilterFunctions;