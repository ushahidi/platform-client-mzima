import DataViewLocators from '../locators/DataViewLocators';
class SurveyFilterFunctions {
    click_data_view_btn(){
        cy.get(DataViewLocators.dataViewBtn).click();
    }

    check_post_filter_by_survey(){
        cy.get(DataViewLocators.posts)
        .contains('There are no posts yet!').should('exist');
        cy.get(DataViewLocators.surveySelectionList)
        .children(DataViewLocators.surveySelectItem)
        .eq(0)
        .click({force: true});
        cy.get(DataViewLocators.postPreview)
        .children(DataViewLocators.postItem)
        .should('not.be.empty');
    }
}

export default SurveyFilterFunctions;