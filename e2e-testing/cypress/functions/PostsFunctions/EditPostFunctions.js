import EditPostLocators from '../../locators/PostsLocators/EditPostLocators';

class EditPostFunctions {
  click_add_post_btn() {
    cy.get(EditPostLocators.addPostBtn).click();
  }

  select_survey_item() {
    cy.get(EditPostLocators.surveyItem).click();
  }

  type_post_title(title) {
    cy.get(EditPostLocators.postTitleField).eq(0).type(title).should('have.value', title);
  }

  type_post_description(description) {
    cy.get(EditPostLocators.postDescField).type(description).should('have.value', description);
  }

  save_post() {
    cy.get(EditPostLocators.savePostBtn).click();
  }
  add_post() {
    this.click_add_post_btn();
    this.select_survey_item();
    this.type_post_title('New Post Title');
    this.type_post_description('New Post Description');
    cy.get(EditPostLocators.postCheckBox).click({ force: true });
    this.save_post();
    cy.get(EditPostLocators.successBtn).click();
  }

  verify_added_post_exists() {
    cy.wait(1000);
    cy.get(EditPostLocators.postPreview)
      .children(EditPostLocators.postItem)
      .contains('New Post Title');
  }

  edit_post() {
    cy.get(EditPostLocators.editPostBtn).eq(0).click({ force: true });
    cy.get(EditPostLocators.postTitleField).eq(0).type(' 2');
    this.save_post();
  }

  verify_edits_persist() {
    cy.wait(1000);
    cy.get(EditPostLocators.postPreview)
      .children(EditPostLocators.postItem)
      .contains('New Post Title 2');
  }

  edit_post_steps() {
    this.add_post();
    this.verify_added_post_exists({ force: true });
    this.edit_post();
    this.verify_edits_persist();
  }
}

export default EditPostFunctions;
