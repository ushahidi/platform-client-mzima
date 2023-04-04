import { Base, Login, Settings, Surveys } from '../../actions';

describe('Initialize surveys page', () => {
  before(() => {
    Base.goHomePage();
    Base.saveLocalStorage('USH_is_onboarding_done', 'true');
    Base.checkExistSelector('app-cookies-notification');
    Base.checkContainAndClickElement('button-decline-cookies', 'Decline');
    Login.loginForm();
    Settings.checkSettingsPage();
    Surveys.checkSurveyPage();
  });

  it('Click add survey button', () => {
    Base.checkExistElement('btn-settings-create');
    Base.checkContainElementClickable('btn-settings-create', 'Add Survey');
    Base.clickElement('btn-settings-create');

    Base.checkExistSelector('app-settings-header');
    Base.checkExistElement('title');
    Base.checkContainElement('title', 'Add Survey');

    // Translations.ClickTranslationButton();
    // Translations.AddTranslation(['es']);
    // Translations.SelectTranslation('Spanish');
    // Translations.SelectTranslation('English');
    //
    // Translations.ClickTranslationButton();
    // Translations.AddTranslation(['es', 'nl']);
    // Translations.SelectTranslation('English');

    // Base.checkContainAndClickSelector('.mat-tab-label', 'Configure');
    // Base.checkContainAndClickSelector('.mat-tab-label', 'Share');
    // Base.checkContainAndClickSelector('.mat-tab-label', 'Main info');

    Base.checkExistElement('name');
    Base.checkExistElement('description');
    Base.inputField('name', 'Test survey');
    Base.inputField('description', 'Test survey description');

    // Base.inputField('survey-name-es', 'Test survey name spanish');
    // Base.inputField('survey-description-es', 'Test survey description spanish');

    Base.checkContainElementClickable('survey-add-field', 'Add Field');
    Base.checkContainElementClickable('btn-add-task', 'Add Task');
  });
});
