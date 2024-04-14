import LoginFunctions from '../../functions/LoginFunctions';
import CollectionFunctions from '../../functions/CollectionFunctions';

const collectionFunctions = new CollectionFunctions();
describe('Automated Tests for Collections', () => {
  const loginFunctions = new LoginFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it('Creates Collection', () => {
    collectionFunctions.create_collection();
  });

  it.skip('Add post to collection', () => {
    collectionFunctions.add_post_to_collection();
  });
});

describe('Verify collection for logged out user', () => {
  it.skip('verifies collection visible for logged out user', () => {
    cy.visit(Cypress.env('baseUrl'));
    //close onboarding modals
    cy.get('[data-qa="btn-close"]').click();

    collectionFunctions.open_all_collections_modal();
    collectionFunctions.search_collection();

    //verify collection and open collection
    collectionFunctions.open_everyone_collection();

    collectionFunctions.verify_everyone_collection_opened();
  });
});
