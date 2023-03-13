import testData from '../../fixtures/test-data.fixture';
import { Base } from './index';

class LoginActions {
  loginInputForm() {
    cy.get('form').within(() => {
      Base.inputField('email', testData.loginData.login);
      Base.inputField('password', testData.loginData.password);
      Base.checkContainElement('btn-login', 'Log in');
      Base.submitButton();
    });
    return this
  }

  loginForm() {
    Base.checkExistSelector('app-login');
    this.loginInputForm();
  }
}

export default new LoginActions();
