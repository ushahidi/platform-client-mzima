import LoginFunctions from "../../functions/LoginFunctions";
import CategoryFunctions from "../../functions/CategoryFunctions";

describe("Automated Tests for Edit Post", () => {
  const loginFunctions = new LoginFunctions();
  const categoryFunctions = new CategoryFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
  });

  it("Add and verify child category", () => {
    categoryFunctions.open_category_creation_page_steps();
    categoryFunctions.add_parent_category_with_restrictions();
    categoryFunctions.add_child_category();
    categoryFunctions.verify_child_category_exists_under_parent();
    categoryFunctions.open_child_category();
    categoryFunctions.verify_visibility_matches_parent();
  });
});