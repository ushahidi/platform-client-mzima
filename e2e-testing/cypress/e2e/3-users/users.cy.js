import LoginPage from "../../pages/LoginPage";
import UserPage from "../../pages/UserPage";

describe("Automated Tests for Users", () => {
  const loginPage = new LoginPage();
  const userPage = new UserPage();

  beforeEach(() => {
    loginPage.login_as_admin();
  });
  it("Adds User", () => {
    userPage.add_user();
  });
  it("Deletes User",()=>{
    userPage.delete_user();
  })
});
