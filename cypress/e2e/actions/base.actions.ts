class BaseActions {
  get Actions() {
    return this;
  }

  goHomePage() {
    cy.visit('/');
    return this;
  }

  goToPage(page: string) {
    cy.visit(page);
    return this;
  }

  inputField(element: string, content: string) {
    cy.get(`[data-qa=${ element }]`).clear().type(content);
    return this;
  }

  submitButton() {
    cy.root().submit();
    return this;
  }

  clickElement(element: string) {
    cy.get(`[data-qa=${ element }]`).click();
    return this;
  }

  checkExistSelector(selector: string) {
    cy.get(selector).should('exist');
    return this;
  }

  checkContainElement(element: string, content: string) {
    cy.get(`[data-qa=${ element }]`).contains(content);
    return this;
  }
}

export default new BaseActions();
