import { Base } from '../index';

class SettingsActions {
  checkSettingsPage() {
    Base.checkExistSelector('[data-qa="btn-settings"]');
    Base.clickElement('btn-settings');
    return this;
  }
}

export default new SettingsActions();
