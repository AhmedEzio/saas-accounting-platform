import User from "../../models/User.js";
/**
 * Search functionality
 */
export async function accountantsSearch(searchWord) {
  const search = {};
  search.$or = [
    { name: { $regex: searchWord, $options: "i" } },
    { email: { $regex: searchWord, $options: "i" } },
    { role: { $regex: searchWord, $options: "i" } },
  ];

  return await User.find(search).sort({createdAt: -1});
}
