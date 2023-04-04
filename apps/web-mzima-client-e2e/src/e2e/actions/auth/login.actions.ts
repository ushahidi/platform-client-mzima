import testData from '../../../fixtures/test-data.fixture';
import { Base } from '../index';

class LoginActions {
  loginInputForm() {
    Base.checkExistElement('email');
    Base.checkExistElement('password');
    Base.inputField('email', testData.loginData.login);
    Base.inputField('password', testData.loginData.password);
    Base.checkContainElement('btn-auth', 'Log in');
    Base.clickElement('btn-login');
    return this;
  }

  loginForm() {
    Base.checkExistElement('btn-auth');
    Base.clickElement('btn-auth');
    Base.checkExistSelector('app-login');
    Base.checkExistSelector('app-login-form');
    this.loginInputForm();
  }
}

export default new LoginActions();
