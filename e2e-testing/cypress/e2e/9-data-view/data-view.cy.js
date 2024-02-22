import LoginFunctions from "../../functions/LoginFunctions";
import DataViewFunctions from "../../functions/DataViewFunctions";

describe("Automated Tests for Sorting data view", () => {
  const loginFunctions = new LoginFunctions();
  const dataViewFunctions = new DataViewFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
  });

  it("Sorts post by date created (Newest first & Oldest first)", () => {
    dataViewFunctions.create_comparison_posts()
    dataViewFunctions.sort_by_date_created_newest_first();
    dataViewFunctions.sort_by_date_created_oldest_first();
  });

  it("Sorts post by date updated (Newest first & Oldest first)", () => {
    dataViewFunctions.edit_comparison_posts()
    dataViewFunctions.sort_by_date_updated_newest_first()
    dataViewFunctions.sort_by_date_updated_oldest_first()
  });

  it("It deletes dummy posts created", () => {
    dataViewFunctions.delete_comparison_posts()
  });
});
