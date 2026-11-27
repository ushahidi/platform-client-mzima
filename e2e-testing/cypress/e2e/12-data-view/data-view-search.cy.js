import DataViewFunctions from '../../functions/DataViewFunctions/DataViewFunctions';
import LoginFunctions from '../../functions/LoginFunctions';

const dataViewFunctions = new DataViewFunctions();
import PostFunctions from '../../functions/PostsFunctions/PostFunctions';

describe('Search and Verify Posts', () => {
  const loginFunctions = new LoginFunctions();
  const postFunctions = new PostFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it('should display posts with the keyword in title or description', () => {
    const searchKeyword = 'election';
    dataViewFunctions.search_and_verify_results(searchKeyword);
  });

  it('should display an empty state when searching with special characters', () => {
    const generateSpecialCharacterKeyword = () => {
      const specialChars = '!@#$%^&*()_+-=[]{};\':"\\|,.<>/?`~';
      let keyword = '';
      const length = Math.floor(Math.random() * 10) + 1;
      for (let i = 0; i < length; i++) {
        keyword += specialChars[Math.floor(Math.random() * specialChars.length)];
      }
      return keyword;
    };
    const specialCharKeyword = generateSpecialCharacterKeyword();
    dataViewFunctions.search_and_verify_results_with_special_characters(specialCharKeyword);
  });
});
