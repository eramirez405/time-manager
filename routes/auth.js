const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const AuthUser = require("../models/AuthUser");

AuthUser.countDocuments({}, async (e, c) => {
  if (e) {
    console.log(e);
  } else {
    if (c === 0) {
      console.log("Adding first user");

      user = new AuthUser({
        name: "admin",
        email: "admin@admin.com",
        password: "palabra",
        role: "admin",
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(user.password, salt);

      await user.save();
    }
  }
});

// @route   GET api/auth
// @desc    Get the user
// @access  Protected
router.get("/", auth, async (req, res) => {
  try {
    const user = await AuthUser.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error...");
  }
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post(
  "/",
  [
    check("email", "Include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await AuthUser.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
          email: user.email,
          department: user.department,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
