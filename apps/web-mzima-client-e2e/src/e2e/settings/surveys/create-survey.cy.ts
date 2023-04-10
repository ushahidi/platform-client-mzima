import { Login, Settings, Surveys } from '../../actions';

describe('Initialize surveys page', () => {
  before(() => {
    cy.visit('/');
    localStorage.setItem('USH_is_onboarding_done', 'true');
    cy.get('app-cookies-notification').should('exist');
    cy.get(`[data-qa="button-decline-cookies"]`).contains('Decline').click();
    Login.loginForm();
    Settings.checkSettingsPage();
    Surveys.checkSurveyPage();
  });

  it('Click add survey button', () => {
    cy.get(`[data-qa="btn-settings-create"]`).should('exist');
    cy.get(`[data-qa="btn-settings-create"]`).contains('Add Survey').focused();
    cy.get(`[data-qa="btn-settings-create"]`).click();

    cy.get('app-settings-header').should('exist');
    cy.get(`[data-qa="title"]`).should('exist');
    cy.get(`[data-qa="title"]`).contains('Add Survey');

    // add translate for survey and select language
    // Translations.ClickTranslationButton();
    // Translations.SelectTranslation(['es']);
    // Translations.ChooseTranslation('Spanish');
    // Translations.ChooseTranslation('English');

    // Translations.ClickTranslationButton();
    // Translations.SelectTranslation(['es']);
    // Translations.ChooseTranslation('English');

    // check tabs ('Main info', 'Configure', 'Share')
    // cy.get('.mat-tab-label').contains('Configure').click();
    // cy.get('.mat-tab-label').contains('Share').click();
    // cy.get('.mat-tab-label').contains('Main info').click();

    // set survey name && description
    cy.get(`[data-qa="name"]`).should('exist');
    cy.get(`[data-qa="description"]`).should('exist');
    cy.get(`[data-qa="name"]`).clear().type('Test survey');
    cy.get(`[data-qa="description"]`).clear().type('Test survey description');

    // if select language (ex. 'es'), then set survey name && description for this language
    // cy.get(`[data-qa="survey-name-es"]`).clear().type('Test survey name spanish');
    // cy.get(`[data-qa="survey-description-es"]`).clear().type('Test survey description spanish');

    // Add field
    cy.get(`[data-qa="btn-survey-add-field"]`).contains('Add Field').focused();
    cy.get(`[data-qa="btn-survey-add-field"]`).click();
    cy.get('.fields-list').should('exist');
    cy.get('.list-item').should('exist');
    // [data-qa-"select-survey.short_text"]
    // [data-qa-"select-survey.long_text"]
    // [data-qa-"select-survey.number_decimal"]
    // [data-qa-"select-survey.number_integer"]
    // [data-qa-"select-survey.location"]
    // [data-qa-"select-survey.date"]
    // [data-qa-"select-survey.datetime"]
    // [data-qa-"select-survey.select"]
    // [data-qa-"select-survey.radio_button"]
    // [data-qa-"select-survey.checkbox"]
    // [data-qa-"select-survey.related_post"]
    // [data-qa-"select-survey.upload_image"]
    // [data-qa-"select-survey.embed_video"]
    // [data-qa-"select-survey.markdown"]
    // [data-qa-"select-survey.categories"]
    cy.get(`[data-qa="select-survey.short_text"]`).should('exist');
    cy.get(`[data-qa="select-survey.short_text"]`).click();
    cy.get(`[data-qa="selected-field-name"]`).should('exist');
    cy.get(`[data-qa="selected-field-name"]`).clear().type('Text');
    cy.get(`[data-qa="selected-field-description"]`).should('exist');
    cy.get(`[data-qa="selected-field-description"]`).clear().type('Description');
    // cy.get('[data-qa="toggle-required"] input').click({ force: true });
    // cy.get('[data-qa="toggle-required"] input').should('be.checked');
    // cy.get('[data-qa="toggle-required"] input').click({ force: true });
    // cy.get('[data-qa="toggle-required"] input').should('not.checked');
    // cy.get('[data-qa="toggle-private"] input').click({ force: true });
    // cy.get('[data-qa="toggle-private"] input').should('be.checked');
    // cy.get('[data-qa="toggle-private"] input').click({ force: true });
    // cy.get('[data-qa="toggle-private"] input').should('not.checked');
    cy.get(`[data-qa="default-value"]`).should('exist');
    cy.get(`[data-qa="btn-add-field"]`).click();

    // check added field
    cy.get(`[data-qa="field-name"]`).should('exist');
    cy.get(`[data-qa="field-name"]`).contains('Text');

    // check edit field button and cancel edit
    cy.get(`[data-qa="btn-field-edit-Text"]`).should('exist');
    cy.get(`[data-qa="btn-field-edit-Text"]`).click();
    cy.get(`[data-qa="selected-field-description"]`).should('exist');
    cy.get(`[data-qa="selected-field-description"]`).should('exist');
    cy.get(`[data-qa="btn-cancel-field"]`).click();

    // check delete field button
    cy.get(`[data-qa="btn-field-delete-Text"]`).should('exist');

    // add task
    // check add task button
    cy.get(`[data-qa="btn-add-task"]`).contains('Add Task').focused().should('exist');
    cy.get(`[data-qa="btn-add-task"]`).click();
    // check modal
    cy.get(`[data-qa="task-modal-title"]`).contains('Add Task').should('exist');
    cy.get(`[data-qa="survey-task-cancel"]`).contains('Cancel').focused().should('exist');
    cy.get(`[data-qa="survey-task-add"]`).contains('Add').focused().should('exist');

    // input task name and description
    cy.get(`[data-qa="survey-task-name"]`).clear().type('Text task');
    cy.get(`[data-qa="survey-task-description"]`).clear().type('Text description task');
    cy.get('[data-qa="task-toggle-required"] input').click({ force: true });
    cy.get('[data-qa="task-toggle-required"] input').should('be.checked');
    cy.get(`[data-qa="survey-task-add"]`).click();

    // cy.get(`[data-qa="btn-survey-add-field"]`).click();
    // cy.get('.fields-list').should('exist');
    // cy.get('.list-item').should('exist');
    // cy.get(`[data-qa="select-survey.number_integer"]`).should('exist');
    // cy.get(`[data-qa="select-survey.number_integer"]`).click();

    // check save and cancel buttons
    cy.get(`[data-qa="btn-cancel-survey-item"]`).contains('Cancel').focused().should('exist');
    cy.get(`[data-qa="btn-save-survey-item"]`).contains('Add Survey').focused().should('exist');

    // save survey
    cy.get(`[data-qa="btn-save-survey-item"]`).click();
  });
});
