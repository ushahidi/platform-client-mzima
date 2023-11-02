import ShareButtonPostLocators from '../locators/ShareButtonPostLocators';
class ShareButtonPostFunctions {
    click_data_view_btn(){
        cy.get(ShareButtonPostLocators.dataViewBtn).click()
    }

    verify_share_button_on_post(){
        cy.get(ShareButtonPostLocators.surveySelectionList)
        .children(ShareButtonPostLocators.surveySelectItem)
        .eq(0)
        .click({force: true})
        cy.get(ShareButtonPostLocators.postPreview)
        .children(ShareButtonPostLocators.postItem)
        .eq(0)
        .find(ShareButtonPostLocators.postShare)
        // .get(ShareButtonPostLocators.postShare)
        .click()

    }
}

export default ShareButtonPostFunctions;