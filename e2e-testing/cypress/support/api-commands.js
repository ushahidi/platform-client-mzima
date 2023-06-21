//@ts-check

/**
 * Logs in a user using api request
 *
 * @param {object} [credentials] - credentials object
 * @param {string} [credentials.username] - username that defaults to admin email in the environment variables
 * @param {string} [credentials.password] - password that defaults to admin password in the environment variables
 * @param {boolean} [credentials.skipOnboarding] - skips onboarding if true
 * @param {string} [credentials.cookieConsent] - skips onboarding if true
 * @returns {void}
 * @example cy.apiLogin()
 * @example cy.apiLogin('test', 'password')
 * @example cy.apiLogin('test', 'password', false)
 *
 */
const apiLogin = ({
  username = Cypress.env('ush_admin_email'),
  password = Cypress.env('ush_admin_pwd'),
  skipOnboarding = true,
  cookieConsent = 'true',
} = {}) => {
  cy.session(`${username} | ${password}`, () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/oauth/token`,
      body: {
        grant_type: 'password',
        client_id: Cypress.env('client_id'),
        client_secret: Cypress.env('client_secret'),
        scope: '*',
        username,
        password,
      },
    }).then((response) => {
      const { access_token } = response.body;
      localStorage.setItem('USH_accessToken', access_token);
      localStorage.setItem('USH_tokenType', 'Bearer');
      cy.request({
        url: `${Cypress.env('apiUrl')}/api/v5/users/me`,
        headers: { Authorization: `Bearer ${access_token}` },
      }).then((response) => {
        const { allowed_privileges, permissions, id, realname, role, email, gravatar } =
          response.body.result;
        localStorage.setItem('USH_userId', id);
        localStorage.setItem('USH_allowed_privileges', allowed_privileges.join(','));
        localStorage.setItem('USH_role', role);
        localStorage.setItem('USH_email', email);
        localStorage.setItem('USH_realname', realname);
        localStorage.setItem('USH_permissions', permissions.join(','));
        localStorage.setItem('USH_gravatar', gravatar);
        localStorage.setItem('USH_grantType', 'password');
      });
    });
  }).then(() => {
    if (skipOnboarding) localStorage.setItem('USH_is_onboarding_done', 'true');
    cy.setCookie('CookieAccepted', cookieConsent);
  });
};

/**
 * Adds a new role using an api request.
 *
 * @param {object} role - The role to add
 * @param {string} role.name - The name of the role
 * @param {string} role.description - The description of the role
 * @param {Array<string>} role.permissions - A list of permissions for the role
 * @returns {void}
 */

const apiAddRole = ({ name, description, permissions }) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/v5/roles`,
    headers: {
      'Accept-Language': 'en-us',
      Authorization: `Bearer ${localStorage.getItem('USH_accessToken')}`,
    },
    body: { name, display_name: name, description, permissions, protected: false },
  }).then((response) => {
    expect(response.status).to.eq(200);
    cy.wrap(response.body.result, { log: false }).as('newRole');
  });
};

Cypress.Commands.addAll({ apiLogin, apiAddRole });
