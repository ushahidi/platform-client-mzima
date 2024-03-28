import CollectionLocators from '../locators/CollectionLocators';

class CollectionFunctions {
  click_collections_button() {
    cy.get(CollectionLocators.collectionBtn).click();
    cy.get(CollectionLocators.addcollectionBtn).click();
  }

  type_name(name) {
    cy.get(CollectionLocators.collectionNameField).type(name).should('have.value', name);
  }

  type_description(description) {
    cy.get(CollectionLocators.collectionDescField).clear().type(description);
  }

  visibility() {
    cy.get(CollectionLocators.onlyMeRadio).click({ force: true });
  }

  save_collection() {
    cy.get(CollectionLocators.saveCollectionBtn).click();
  }

  open_collections() {
    cy.get(CollectionLocators.collectionBtn).click();
  }

  select_collections() {
    cy.get(CollectionLocators.selectCollection).eq(0).click();
  }

  type_post_title(title) {
    cy.get(CollectionLocators.postTitleField).eq(0).type(title).should('have.value', title);
  }

  type_post_description(description) {
    cy.get(CollectionLocators.postDescField).type(description);
  }

  save_post() {
    cy.get(CollectionLocators.savePostBtn).click();
  }
  post_to_collection() {
    cy.get(CollectionLocators.submitPostButton).click();
    cy.get(CollectionLocators.surveyItem).click();
    this.type_post_title('Post Title');
    this.type_post_description('Post Description');
    cy.get(CollectionLocators.postCheckBox).click({ force: true });
    this.save_post();
    cy.get(CollectionLocators.successBtn).click();
  }

  verify_post_added_to_collection() {
    this.open_collections();
    this.select_collections();
    cy.contains('Post Title').should('exist');
  }

  create_collection() {
    let collectionName = `Automated Collection-${Math.floor(Math.random() * 100000000000)}`;
    this.click_collections_button();
    this.type_name(collectionName);
    this.type_description('Automated Description');
    this.visibility();
    this.save_collection();
  }

  add_post_to_collection() {
    this.post_to_collection();
    this.verify_post_added_to_collection();
  }
}

export default CollectionFunctions;
