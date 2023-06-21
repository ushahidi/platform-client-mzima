import LoginPage from "../../pages/LoginPage";
import RolePage from "../../pages/RolePage";

describe("Automated Tests for Roles", () => {
  const loginPage = new LoginPage();
  const rolePage = new RolePage();

  beforeEach(() => {
    loginPage.login_as_admin();
  });
  it("Create Role", () => {
    rolePage.add_and_verify_role();
  });

  it ("Deletes role", ()=>{
        rolePage.delete_role_and_verify_deletion();
  })
});
