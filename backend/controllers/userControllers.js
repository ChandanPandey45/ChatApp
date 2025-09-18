const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const sendEmail = require("../utils/sendEmail");

const otpStore = {};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  // Exclude current user
  if (req.user?._id) {
    keyword._id = { $ne: req.user._id };
  }

  const users = await User.find(keyword);
  res.json(users);
});





const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Generate OTP and send email
  const otp = generateOTP();
  otpStore[email] = otp; // save OTP temporarily
  await sendEmail(email, "Verify your email", `Your OTP is: ${otp}`);

  res.status(200).json({
    message: "OTP sent to email. Please verify to complete registration.",
  });
});

// @desc    Verify OTP and create user
// @route   POST /api/user/verify
// @access  Public
const verifyUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic, otp } = req.body;

  if (otpStore[email] !== otp) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  delete otpStore[email]; // clear OTP after verification

  const user = await User.create({ name, email, password, pic });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User creation failed");
  }
});

// @desc    Auth user with OTP
// @route   POST /api/user/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Generate JWT token directly
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token, // send token to frontend
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});


// @desc    Verify login OTP
// @route   POST /api/user/verify-login-otp
// @access  Public
const verifyLoginOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check OTP
  if (otpStore[email] !== otp) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  // Remove OTP after successful verification
  delete otpStore[email];

  // Generate JWT token
  const token = generateToken(user._id);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    pic: user.pic,
    token, // send token to frontend
  });
});


module.exports = {
  allUsers,
  registerUser,
  verifyUser,
  authUser,
  verifyLoginOTP,
};
