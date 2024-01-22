import ChangeContactEmailAddressLocators from '../locators/ChangeContactEmailAddressLocators';

class ChangeContactEmailAddressFunctions {
    open_general_settings() {
      cy.get(ChangeContactEmailAddressLocators.settingsBtn).click(); 
    }
    change_contact_email_address(){
        cy.get(ChangeContactEmailAddressLocators.email)
        .clear()
        .type("testnew@gmail.com")
    }

    click_save_button() {
      cy.get(ChangeContactEmailAddressLocators.saveBtn).click();
    }

    check_new_contact_email_address_shows(){
        cy.get(ChangeContactEmailAddressLocators.contactEmail).contains('testnew@gmail.com')
    }
  }

  export default ChangeContactEmailAddressFunctions;