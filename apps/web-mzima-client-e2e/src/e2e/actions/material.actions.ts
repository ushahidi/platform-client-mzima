import { Base } from './index';

class MaterialActions {
  closeModal(element: string, value: string) {
    Base.checkContainAndClickElement(element, value);
    cy.get('.cdk-overlay-backdrop').click(-50, -50, { force: true });
  }
}

export default new MaterialActions();
