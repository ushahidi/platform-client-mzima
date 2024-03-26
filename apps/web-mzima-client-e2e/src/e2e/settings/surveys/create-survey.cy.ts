import { Login, Settings, Surveys, Translations } from '../../actions';
import 'cypress-axe'

/** Add RadioButton (Field) */
function addRadioButton() {
  cy.get(`[data-qa="select-survey.radio_button"]`).should('exist').click();
  cy.get(`[data-qa="field-options"]`).should('exist');

  // add options for radio buttons
  const options = new Array(5);
  for (const index of options.keys()) {
    cy.get(`[data-qa="btn-add-option"]`).should('exist').click();
    cy.get(`[data-qa="option-${index}"]`).clear().type(`Option ${index}`).should('exist');
    if (index > 0) cy.get(`[data-qa="btn-remove-option-${index}"]`).should('exist');
    if (index === options.length - 1)
      cy.get(
        `[data-qa="btn-remove-option-${Math.floor(Math.random() * (options.length - 1 + 1) + 1)}"]`
      )
        .click()
        .should('not.exist');
  }
}

/** Add Categories (Field) */
function addCategories() {
  cy.get(`[data-qa="select-survey.categories"]`).should('exist').click();
  cy.get('app-multilevel-selection').should('exist');

  // select all categories
  cy.get('[data-qa="select_all"] input').click({ force: true }).should('be.checked');
  cy.wait(1000);

  //deselect all categories
  cy.get('[data-qa="select_all"] input').click({ force: true }).should('not.checked');
  cy.wait(1000);

  // open expand translation category
  cy.get('[data-qa="btn-tag-toggle-translation"]').click();
  cy.wait(1000);

  // select one category from translation category
  cy.get('[data-qa="tag-translated"] input').click({ force: true }).should('be.checked');
  cy.wait(1000);
}

/** Add Fields */
function addFields(field: string, value: string) {
  switch (field) {
    case 'short_text':
    case 'long_text':
    case 'number_decimal':
    case 'number_integer':
      cy.get(`[data-qa="select-survey.${field}"]`).should('exist').click();
      break;
    case 'radio_button':
      addRadioButton();
      break;
    case 'categories':
      addCategories();
      break;
  }

  cy.get(`[data-qa="selected-field-name"]`).should('exist');

  switch (field) {
    case 'number_decimal':
      cy.get(`[data-qa="default-number"]`).clear().type(value).should('exist');
      cy.get('#field_value').within(() => {
        cy.get(`input`)
          .invoke('val')
          .then((val: any) => {
            expect(/((?<!\S)[-+]?[0-9]*[.,][0-9]+$)/gm.test(val)).to.be.true;
          });
      });
      break;
    case 'number_integer':
      cy.get(`[data-qa="default-number"]`).clear().type(value).should('exist');
      cy.get('#field_value').within(() => {
        cy.get(`input`)
          .invoke('val')
          .then((val: any) => {
            expect(/^-?\d+$/gm.test(val)).to.be.true;
          });
      });
      break;
    default:
      cy.get(`[data-qa="selected-field-name"]`).clear().type(field).should('exist');
  }

  cy.get(`[data-qa="selected-field-description"]`).should('exist');
  cy.get(`[data-qa="selected-field-description"]`).clear().type('Description').should('exist');

  if (field !== 'categories') {
    cy.get('[data-qa="toggle-required"] input').click({ force: true }).should('be.checked');
    cy.wait(1000);
    cy.get('[data-qa="toggle-required"] input').click({ force: true }).should('not.checked');

    cy.get('[data-qa="toggle-private"] input').click({ force: true }).should('be.checked');
    cy.wait(1000);
    cy.get('[data-qa="toggle-private"] input').click({ force: true }).should('not.checked');

    switch (field) {
      case 'number_decimal':
      case 'number_integer':
        cy.get(`[data-qa="default-number"]`).should('exist');
        break;
      case 'date':
        cy.get(`[data-qa="default-date"]`).should('exist');
        break;
      case 'location':
        cy.get(`[data-qa="default-location"]`).should('exist');
        break;
      default:
        cy.get(`[data-qa="default-value"]`).should('exist');
    }
  }
  cy.get(`[data-qa="btn-add-field"]`).click();
}

/** Add Translation */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function selectTranslation(languages: string[], { lang, short }: { lang: string; short: string }) {
  Translations.ClickTranslationButton();
  Translations.SelectTranslation(languages);
  Translations.ChooseTranslation(lang);

  // if select language (ex. 'es'), then set survey name && description for this language
  if (short !== 'en') {
    cy.get(`[data-qa="survey-name-${short}"]`)
      .clear()
      .type(`Test survey name ${lang}`)
      .should('exist');
    cy.get(`[data-qa="survey-description-${short}"]`)
      .clear()
      .type(`Test survey description ${lang}`)
      .should('exist');
  }
}

describe('Initialize surveys page', () => {
  before(() => {
    cy.visit('/');
    localStorage.setItem('USH_is_onboarding_done', 'true');
    cy.get('app-cookies-notification').should('exist');
    cy.get(`[data-qa="button-decline-cookies"]`).contains('Decline').click();
    Login.loginForm();
    cy.wait(1000);
    Settings.checkSettingsPage();
    cy.wait(1000);
    Surveys.checkSurveyPage();
    cy.wait(1000);
  });

  it('Click add survey button', () => {
    cy.get(`[data-qa="btn-settings-create"]`).should('exist');
    cy.get(`[data-qa="btn-settings-create"]`).contains('Add Survey').focused();
    cy.get(`[data-qa="btn-settings-create"]`).click();

    cy.get('app-settings-header').should('exist');
    cy.get(`[data-qa="title"]`).should('exist');
    cy.get(`[data-qa="title"]`).contains('Add Survey');

    /** add translate for survey and select language */
    // selectTranslation(['es'], { lang: 'Spanish', short: 'es' });
    // cy.wait(1000);
    // selectTranslation(['es'], { lang: 'English', short: 'en' });
    // cy.wait(1000);

    /** check tabs ('Main info', 'Configure', 'Share') */
    cy.get('.mat-tab-label').contains('Configure').click();
    cy.wait(1000);
    cy.get('.mat-tab-label').contains('Share').click();
    cy.wait(1000);
    cy.get('.mat-tab-label').contains('Main info').click();

    /** set survey name && description */
    cy.get(`[data-qa="name"]`).should('exist');
    cy.get(`[data-qa="description"]`).should('exist');
    cy.get(`[data-qa="name"]`).clear().type('Auto test survey').should('exist');
    cy.get(`[data-qa="description"]`).clear().type('Auto test survey description').should('exist');

    /** Add field */
    cy.wait(1000);
    cy.get(`[data-qa="btn-survey-add-field"]`).contains('Add Field').focused();
    cy.get(`[data-qa="btn-survey-add-field"]`).click();
    cy.get('.fields-list').should('exist');
    cy.get('.list-item').should('exist');

    /**
     * Types fields
     * 'short_text', 'long_text', 'number_decimal', 'number_integer', 'location'
     * 'date', 'datetime', 'select', 'radio_button', 'checkbox', 'related_post'
     * 'upload_image', 'embed_video', 'markdown', 'categories'
     */
    const fieldName = 'categories';
    const valueName = 'categories';
    addFields(fieldName, valueName);

    /** check added field */
    cy.get(`[data-qa="field-name"]`).should('exist');
    cy.get(`[data-qa="field-name"]`).contains(valueName || fieldName);

    /** check edit field button and cancel edit */
    cy.get(`[data-qa="btn-field-edit-${valueName || fieldName}"]`)
      .should('exist')
      .click();
    cy.wait(2000);
    cy.get(`[data-qa="selected-field-name"]`).should('exist');
    cy.get(`[data-qa="selected-field-description"]`).should('exist');
    cy.get(`[data-qa="btn-cancel-field"]`).click();

    /** check delete field button */
    cy.get(`[data-qa="btn-field-delete-${valueName || fieldName}"]`).should('exist');

    /** add task */
    /** check add task button */
    cy.get(`[data-qa="btn-add-task"]`).contains('Add Task').focused().should('exist');
    cy.get(`[data-qa="btn-add-task"]`).click();

    /** check modal */
    cy.get(`[data-qa="task-modal-title"]`).contains('Add Task').should('exist');
    cy.get(`[data-qa="survey-task-cancel"]`).contains('Cancel').focused().should('exist');
    cy.get(`[data-qa="survey-task-add"]`).contains('Add').focused().should('exist');

    /** input task name and description */
    cy.get(`[data-qa="survey-task-name"]`).clear().type('Text task');
    cy.get(`[data-qa="survey-task-description"]`).clear().type('Text description task');
    cy.get('[data-qa="task-toggle-required"] input').click({ force: true });
    cy.get('[data-qa="task-toggle-required"] input').should('be.checked');
    cy.get(`[data-qa="survey-task-add"]`).click();

    /** check save and cancel buttons */
    cy.get(`[data-qa="btn-cancel-survey-item"]`).contains('Cancel').focused().should('exist');
    cy.get(`[data-qa="btn-save-survey-item"]`).contains('Add Survey').focused().should('exist');

    /** save survey */
    cy.get(`[data-qa="btn-save-survey-item"]`).click();

    // Perform accessibility checks
    cy.injectAxe();
    cy.checkA11y();
  });
});
