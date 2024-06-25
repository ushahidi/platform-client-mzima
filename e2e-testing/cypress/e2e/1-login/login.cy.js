import LoginFunctions from '../../functions/LoginFunctions';

const loginFunctions = new LoginFunctions();

describe('Login as Admin', () => {
  it('Logs in as admin user', () => {
    loginFunctions.login_as_admin();
  });
});

describe('Login as Member', () => {
  it('Logs in as member user', () => {
    loginFunctions.login_member_user();
  });
});

describe('Verify Invalid Login Credentials', () => {
  it('Attempts login with invalid credentials', () => {
    loginFunctions.verify_negative_login();
  });
});
