/// <reference types="cypress" />

import { faker } from '@faker-js/faker';
import * as settingsRoleLocators from '../../locators/settings-roles-locators';

describe('Roles CRUD', () => {
  beforeEach(() => {
    cy.apiLogin();
    cy.visit('/settings/roles');
  });

  it('should create a role successfully', () => {
    const role = {
      name: `QA-${faker.company.buzzVerb()}-${Cypress._.random(0, 1e10)}`,
      description: 'Test Role Description',
      permissions: ['Manage Users', 'Manage Posts', 'Manage Settings'],
    };
    cy.addRole(role);
    cy.get(settingsRoleLocators.roleLink(role.name)).should('contain', role.name);
  });

  it('should update a role successfully', () => {
    const role = {
      name: `QA-${faker.company.buzzVerb()}-${Cypress._.random(0, 1e10)}`,
      description: 'Test Role Description',
      permissions: [
        'Manage Users',
        'Manage Posts',
        'Manage Settings',
        'Bulk Data Import and Export',
        'Edit their own posts',
      ],
    };
    const newRoleName = `${role.name}-updated`;
    const additionalPermissions = [
      'Manage Collections and Saved Searches',
      'Delete Posts',
      'Delete Their Own Posts',
    ];
    cy.apiAddRole(role).then((newRole) => {
      cy.reload();
      cy.get(settingsRoleLocators.roleLink(role.name)).should('contain', role.name).click();
      cy.get(settingsRoleLocators.roleItemHeader).should('contain', 'Edit Role');

      cy.get(settingsRoleLocators.roleNameInput)
        .should('have.value', role.name)
        .clear()
        .type(newRoleName);
      cy.get(settingsRoleLocators.roleDescriptionInput).should('have.value', role.description);
      for (const permission of role.permissions) {
        cy.get(settingsRoleLocators.rolesPermissionsCheckboxes[permission]).should(
          'have.attr',
          'aria-selected',
          'true',
        );
      }
      for (const permission of additionalPermissions) {
        cy.get(settingsRoleLocators.rolesPermissionsCheckboxes[permission])
          .click()
          .should('have.attr', 'aria-selected', 'true');
      }

      cy.get(settingsRoleLocators.saveRoleButton)
        .find('button')
        .should('be.enabled')
        .and('contain.text', 'Update & close')
        .click();
      cy.get(settingsRoleLocators.roleLink(newRoleName)).should('contain', newRoleName);
      cy.get(settingsRoleLocators.roleLink(role.name)).should('not.exist');

      cy.visit(`/settings/roles/update/${newRole.id}`);
      cy.get(settingsRoleLocators.roleNameInput).should('have.value', newRoleName);
      for (const permission of [...additionalPermissions, ...role.permissions]) {
        cy.get(settingsRoleLocators.rolesPermissionsCheckboxes[permission]).should(
          'have.attr',
          'aria-selected',
          'true',
        );
      }
    });
  });

  it('should delete a custom role successfully', () => {
    const role = {
      name: `QA-To-Delete-${faker.company.buzzVerb()}-${Cypress._.random(0, 1e10)}`,
      description: 'Test Delete Role Description',
      permissions: ['Manage Users', 'Manage Posts'],
    };

    cy.apiAddRole(role).then((newRole) => {
      cy.visit(`/settings/roles/update/${newRole.id}`);
      cy.get(settingsRoleLocators.saveRoleButton).find('button').should('be.enabled');
      cy.get(settingsRoleLocators.deleteRoleButton).click();

      cy.get(settingsRoleLocators.deleteConfirmationModal)
        .should('contain.text', `Are you sure you want to delete role ${role.name}?`)
        .and('contain.text', 'This action cannot be undone.')
        .and('contain.text', 'Are you sure?');
      cy.get(settingsRoleLocators.deleteConfirmationModalButton).click();

      cy.get(settingsRoleLocators.roleLink('Admin')).should('be.visible');
      cy.get(settingsRoleLocators.roleLink(role.name)).should('not.exist');
    });
  });
});
