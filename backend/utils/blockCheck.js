const User = require("../models/User");

const getBlockStatus = async (userId1, userId2) => {
  const [u1, u2] = await Promise.all([
    User.findById(userId1).select("blockedUsers"),
    User.findById(userId2).select("blockedUsers"),
  ]);

  const iBlockedThem = !!u1?.blockedUsers?.some(
    (id) => String(id) === String(userId2)
  );
  const theyBlockedMe = !!u2?.blockedUsers?.some(
    (id) => String(id) === String(userId1)
  );

  return { iBlockedThem, theyBlockedMe };
};

module.exports = { getBlockStatus };