import SignupFunctions from "../../functions/SignupFunctions";

describe("Verify Valid/Invalid Credentials on Signup", () => {
  const signupFunctions = new SignupFunctions();

  it("User Signup flow", () => {
    signupFunctions.signup();
    signupFunctions.verify_signed_user();
  });
});
