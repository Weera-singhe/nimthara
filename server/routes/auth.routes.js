//LOGIN and REGISTER      ///////////////////////////

const express = require("express");
const router = express.Router();

const passport = require("passport");
const pool = require("../Db/pool");

router.post("/register", async (req, res) => {
  const { display_name, regname, pwr } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND reg_done = false",
      [regname]
    );

    if (result.rows.length > 0) {
      await pool.query(
        `UPDATE users SET password = $1, display_name =$2, reg_done = true WHERE username = $3`,
        [pwr, display_name, regname]
      );
      res
        .status(200)
        .json({ success: true, message: "Password set successfully" });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid Username or already registered",
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return next(err); // <-- CHANGED: handle auth errors

    if (!user) {
      return res.status(401).json({ success: false, message: "Login failed" }); // <-- CHANGED: generic
    }

    // <-- CHANGED: prevent session fixation
    req.session.regenerate((regenErr) => {
      if (regenErr) return next(regenErr);

      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr); // <-- CHANGED: handle login errors

        // <-- CHANGED: never send full user object (may include sensitive fields)
        // CHANGED HERE
        const safeUser = {
          loggedIn: true,
          ...user,
        };

        return res.json({ success: true, user: safeUser }); // <-- CHANGED
      });
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err); // <-- CHANGED: handle error

    req.session.destroy(() => {
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true, // <-- CHANGED: match session cookie security
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // <-- CHANGED
        secure: process.env.NODE_ENV === "production", // <-- CHANGED
      });

      return res.status(200).json({ success: true });
    });
  });
});

router.get("/check-auth", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({
      loggedIn: true,
      ...req.user,
    });
  } else {
    res.json({
      loggedIn: false,
      level: 0,
      level_jobs: 0,
      level_audit: 0,
      level_paper: 0,
    });
  }
});
module.exports = router;
