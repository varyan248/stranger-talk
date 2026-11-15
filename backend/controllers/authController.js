const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (await User.findOne({ $or: [{ email }, { username }] }))
      return res.status(400).json({ message: "User exists" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, username, email, password: hash });
    res.json({
      token: generateToken(user._id),
      user: { ...user._doc, password: undefined },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(400).json({ message: "Invalid credentials" });
  res.json({
    token: generateToken(user._id),
    user: { ...user._doc, password: undefined },
  });
};

// exports.me = async (req, res) => res.json(req.user);
exports.me = async (req, res) => {
  try {
    // req.user is populated by authMiddleware
    if (!req.user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: req.user });
  } catch (err) {
    console.error("me error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};