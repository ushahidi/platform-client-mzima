import testData from '../../../fixtures/test-data.fixture';
import { Base, Login, Settings } from '../../actions';

describe('Initialize role page', () => {
  before(() => {
    Base.goHomePage();
    Login.loginForm();
    Settings.checkSettingsPage();
  });

  it('Roles page exists', () => {
    Base.checkExistSelector('[data-qa="btn-roles"]');
    Base.clickElement('btn-roles');
    Base.checkExistSelector('app-roles');
  });

  it('Create role', () => {
    Base.checkExistSelector('[data-qa="btn-add-role"]');
    Base.clickElement('btn-add-role');
    Base.checkExistSelector('app-role-item');

    cy.get('form').within(() => {
      Base.inputField('display_name', testData.roleData.name);
      Base.inputField('description', testData.roleData.description);
      Base.checkField('manage-posts');
      Base.checkContainElement('btn-save-role', 'Save & close');
      Base.submitButton();
    });
  });
});
