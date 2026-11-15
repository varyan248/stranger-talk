const Report = require("../models/Report");
exports.createReport = async (req, res) => {
  const { reported, reason } = req.body;
  const report = await Report.create({
    reporter: req.user._id,
    reported,
    reason,
  });
  res.json(report);
};
