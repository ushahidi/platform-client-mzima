import SignupFunctions from "../../functions/SignupFunctions";

describe("Verify Valid/Invalid Credentials upon user Signup", () => {
  const signupFunctions = new SignupFunctions();

  it("User Signup flow", () => {
    signupFunctions.signup();
  });
});
