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
        .click({force: true})

        // let postId = "";
        // cy.get("mat-icon")
        //   .eq(0)
        //   .find("post")
        //   .then((post) => {
        //     postId=post;
        //     console.log(">>>>>>", postId)

        //   });

        // cy.get(ShareButtonPostLocators.surveyWebAddress)
        //   .should(
        //     'have.value',
        //     `http://localhost:4200/feed/${postId}/view?mode=POST`)
          }
    }

export default ShareButtonPostFunctions;