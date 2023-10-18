import LoginFunctions from "../../functions/LoginFunctions";
import DataViewFunctions from "../../functions/DataViewFunctions";

describe("Automated Tests for Sorting data view", () => {
  const loginFunctions = new LoginFunctions();
  const dataViewFunctions = new DataViewFunctions();

  before(() => {
    loginFunctions.login_as_admin();
  });

  it("Sorts post by created (Newest first & Oldest first)", () => {
    dataViewFunctions.create_comparison_posts();
    dataViewFunctions.sort_by_date_created_newest_first();
    dataViewFunctions.sort_by_date_created_oldest_first()
  });
});
