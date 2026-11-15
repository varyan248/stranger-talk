/**
 * Must run AFTER authMiddleware so req.user is populated.
 * Rejects any request where the authenticated user is not an admin.
 */
module.exports = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  if (!req.user.isAdmin) {
    return res
      .status(403)
      .json({ success: false, message: "Access denied. Admin only." });
  }

  next();
};