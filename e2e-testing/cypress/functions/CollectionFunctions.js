import CollectionLocators from '../locators/CollectionLocators';

class CollectionFunctions {

    click_collections_button() {
        cy.get(CollectionLocators.collectionBtn).click();
        cy.get(CollectionLocators.addcollectionBtn).click();
      }

    type_name(name) {
        cy.get(CollectionLocators.collectionNameField)
          .type(name)
          .should('have.value', name);
      }
    
    type_description(description) {
        cy.get(CollectionLocators.collectionDescField)
          .clear()
          .type(description)
      }

    visibility(){
        cy.get('.mat-radio-container')
          .find('.mat-radio-input')
          .eq(0)
          .click({force: true})
      }

    save_collection() {
      cy.get('#save-collection-btn')
        .click();
    }
    
    open_collections(){
      cy.get(CollectionLocators.collectionBtn)
        .click();
    }

    select_collections(){
      cy.get(".mat-ripple.collection-item")
        .eq(0)
        .click()
    }

    type_post_title(title) {
      cy.get(CollectionLocators.postTitleField).eq(0)
        .type(title)
        .should('have.value', title);
    }
  
    type_post_description(description) {
      cy.get(CollectionLocators.postDescField)
        .type(description)
    }

    save_post() {
      cy.get(CollectionLocators.savePostBtn)
        .click();
    }
    post_to_collection(){
      cy.get(".submit-post-button").click()
      cy.get(CollectionLocators.surveyItem).click();
      this.type_post_title("Post Title");
      this.type_post_description("Post Description");
      cy.get(CollectionLocators.postCheckBox).click({force: true});
      this.save_post();
      cy.get(CollectionLocators.successBtn).click()
    }

    verify_post_added_to_collection(){
      cy.get('mat-selection-list[name="surveys"]')
        .children('mat-list-option')
        .eq(0)
        .click({force: true})
      cy.contains('Post Title').should('exist');
    }

    add_collections() {
      let collectionName = `Automated Collection-${Math.floor(Math.random() * 100000000000)}`
      this.click_collections_button();
      this.type_name(collectionName);
      this.type_description("Automated Description");
      this.visibility();
      this.save_collection();
      this.open_collections();
      this.select_collections()
      this.post_to_collection()
      this.verify_post_added_to_collection()
      }
}

export default CollectionFunctions;