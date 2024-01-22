import LoginFunctions from "../../functions/LoginFunctions";
import PrivateDeploymentFunctions from "../../functions/PrivateDeploymentFunctions";

describe("Automated Tests for Private deployment", () => {
  const loginFunctions = new LoginFunctions();
  const privateDeploymentFunctions = new PrivateDeploymentFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
  });

  it("Steps to make a Private deployment", () => {
    privateDeploymentFunctions.make_deployment_private()
  });
});