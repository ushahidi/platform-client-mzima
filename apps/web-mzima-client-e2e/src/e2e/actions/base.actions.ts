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
    cy.get(`[data-qa="${ element }"]`).clear().type(content);
    return this;
  }

  checkField(element: string) {
    cy.get(`[data-qa="${ element }"]`).find('input').click({ force: true });
    return this;
  }

  submitButton() {
    cy.root().submit();
    return this;
  }

  clickElement(element: string) {
    cy.get(`[data-qa="${ element }"]`).click();
    return this;
  }

  checkExistSelector(selector: string) {
    cy.get(selector).should('exist');
    return this;
  }

  checkExistElement(element: string) {
    cy.get(`[data-qa="${ element }"]`).should('exist');
    return this;
  }

  checkContainElementClickable(element: string, content: string) {
    cy.get(`[data-qa="${ element }"]`).contains(content).focused();
    return this;
  }

  checkContainElement(element: string, content: string) {
    cy.get(`[data-qa="${ element }"]`).contains(content);
    return this;
  }

  checkContainAndClickElement(element: string, content: string) {
    cy.get(`[data-qa="${ element }"]`).contains(content).click();
    return this;
  }

  checkContainAndClickSelector(selector: string, content: string) {
    cy.get(selector).contains(content).click();
    return this;
  }

  saveLocalStorage(key: string, value: string) {
    localStorage.setItem(key, value);
  }
}

export default new BaseActions();
