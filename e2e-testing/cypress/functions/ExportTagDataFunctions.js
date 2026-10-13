import ExportTagDataLocators from '../locators/ExportTagDataLocators';

class ExportTagDataFunctions {
  select_data_fields() {
    for (let i = 0; i <= 3; i++) {
      cy.get(ExportTagDataLocators.FieldsCheckbox).eq(i).click();
    }
  }

  click_select_fields_button() {
    cy.get(ExportTagDataLocators.SelectFieldsButton).click();
  }

  export_all_data() {
    cy.get(ExportTagDataLocators.ExportAllDataButton).click();
  }

  export_data() {
    cy.get(ExportTagDataLocators.ExportDataButton).click();
  }

  launch_export_page() {
    cy.get(ExportTagDataLocators.SettingsBtn).click();
    cy.get(ExportTagDataLocators.ExportAndTagDataButton).click();
    cy.get(ExportTagDataLocators.ExportTab).click();
  }

  cancel_export() {
    cy.get(ExportTagDataLocators.CancelExportBtn).click();
  }

  verify_successful_export_messages() {
    let messageData1 = `We are preparing your CSV file. This may take a few moments. You can leave this page if you want. We will let you know when we're done.`;
    let messageData2 = `Upload complete. You should see your tagged data in your HDX account.`;

    cy.get(ExportTagDataLocators.MessageContainer)
      .should('be.visible')
      .should('have.text', messageData1);

    // cy.intercept('GET', Cypress.env('thumbsUpSignal')).as('completed');
    // cy.wait('@completed', { timeout: 50000 }).then((interception) => {
    //   expect(interception.response.statusCode).to.eq(200);
    //   cy.get(ExportTagDataLocators.MessageContainer).should('have.text', messageData2);
    // });
  }

  export_all_tag_data() {
    this.launch_export_page();
    this.export_all_data();
  }

  export_select_tag_data() {
    this.launch_export_page();
    this.click_select_fields_button();
    this.select_data_fields();
    this.export_data();
  }

  confirm_all_data_export() {
    this.export_all_tag_data();
    this.verify_successful_export_messages();
  }

  confirm_select_data_export() {
    this.export_select_tag_data();
    this.verify_successful_export_messages();
  }

  cancel_data_export() {
    this.export_all_tag_data();
    this.cancel_export();
  }
}

export default ExportTagDataFunctions;
