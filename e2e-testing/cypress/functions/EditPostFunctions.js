import EditPostLocators from '../locators/EditPostLocators';

class EditPostFunctions {

    click_add_post_btn(){
        cy.get(".submit-post-button").click()
    }

    select_survey_item(){
        cy.get(EditPostLocators.surveyItem).click()
    }


    type_post_title(title) {
        cy.get(EditPostLocators.postTitleField)
          .eq(0)
          .type(title)
          .should('have.value', title);
    }

    type_post_description(description) {
        cy.get(EditPostLocators.postDescField)
          .type(description)
          .should('have.value', description);
    }

    save_post() {
      cy.get(EditPostLocators.savePostBtn)
        .click();
    }
    add_post(){
        this.click_add_post_btn()
        this.select_survey_item()
        this.type_post_title("New Post Title")
        this.type_post_description("New Post Description")
        cy.get(EditPostLocators.postCheckBox).click({force: true});
        this.save_post();
        cy.get(EditPostLocators.successBtn).click()
    }

    check_for_added_post_in_survey(){
      cy.get('mat-selection-list[name="surveys"]')
        .children('mat-list-option')
        .eq(0)
        .click({force: true})
      cy.get('ngx-masonry')
        .children('app-post-preview')
        .contains("New Post Title")
      cy.get('.mzima-button.mzima-button--gray.mzima-button--clear.mzima-button--medium.mzima-button--block.mzima-button--icon-only.ng-star-inserted')
        .eq(0)
        .click({force: true})
    }

    edit_post(){
        cy.get(EditPostLocators.postTitleField)
          .eq(0)
          .type(" 2")
        this.save_post();
    }

    check_edit_post(){
        cy.get('ngx-masonry')
        .children('app-post-preview')
        .contains("New Post Title 2")
    }

    edit_post_steps() {
        this.add_post();
        this.check_for_added_post_in_survey({force: true});
        this.edit_post();
        this.check_edit_post();
      }
}

export default EditPostFunctions;