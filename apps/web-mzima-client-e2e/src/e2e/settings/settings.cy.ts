import { Base, Login, Settings } from '../actions';

describe('Initialize surveys page', () => {
  before(() => {
    Base.goHomePage();
    Base.saveLocalStorage('USH_is_onboarding_done', 'true');
    Login.loginForm();
  });

  it('Settings page exists', () => {
    Settings.checkSettingsPage();
  });
});
