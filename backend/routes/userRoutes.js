const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  verifyLoginOTP,
  verifyUser
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/")
  .get(protect, allUsers)
  .post(registerUser);
router.post("/verify", verifyUser);
router.post("/login", authUser);
router.post("/verify-login-otp", verifyLoginOTP); 


module.exports = router;
