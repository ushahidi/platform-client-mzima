import { Base } from '../index';

class SurveysActions {
  checkSurveyPage() {
    Base.checkExistElement('btn-surveys');
    Base.clickElement('btn-surveys');
    Base.checkExistSelector('app-surveys');
    Base.checkExistSelector('app-settings-header');
    Base.checkExistElement('title');
    Base.checkContainElement('title', 'Surveys');
    return this;
  }

  createSurvey() {
    // Base.checkExistSelector('app-login');
    // Base.checkExistSelector('app-login-form');
    // this.loginInputForm();
  }
}

export default new SurveysActions();
