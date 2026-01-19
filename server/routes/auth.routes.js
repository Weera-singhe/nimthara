const express = require("express");
const router = express.Router();

const passport = require("passport");
const pool = require("../Db/pool");

router.post("/register", async (req, res) => {
  const display_name = String(req.body.display_name || "").trim();
  const regname = String(req.body.regname || "").trim();
  const pwr = String(req.body.pwr || "");

  if (!display_name || !regname || !pwr) {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }

  try {
    const result = await pool.query(
      "SELECT id FROM users WHERE username = $1 AND reg_done = false",
      [regname],
    );

    if (result.rows.length > 0) {
      await pool.query(
        `UPDATE users
         SET password = $1, display_name = $2, reg_done = true
         WHERE username = $3`,
        [pwr, display_name, regname],
      );

      return res
        .status(200)
        .json({ success: true, message: "Password set successfully" });
    }

    return res.status(401).json({
      success: false,
      message: "Registration failed",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ success: false, message: "Login failed" });
    }

    req.session.regenerate((regenErr) => {
      if (regenErr) return next(regenErr);

      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);

        const safeUser = {
          loggedIn: true,
          id: user.id,
          display_name: user.display_name,
          level: user.level,
          level_jobs: user.level_jobs,
          level_audit: user.level_audit,
          level_paper: user.level_paper,
          level_stock: user.level_stock,
        };

        req.session.save(() => {
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Pragma", "no-cache");
          return res.json({ success: true, user: safeUser });
        });
      });
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        domain:
          process.env.NODE_ENV === "production" ? ".nimthara.com" : undefined,
      });

      return res.status(200).json({ success: true });
    });
  });
});

router.get("/check-auth", (req, res) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.isAuthenticated?.() && req.user) {
    const u = req.user;

    return res.json({
      loggedIn: true,
      id: u.id,
      display_name: u.display_name,
      level: u.level,
      level_jobs: u.level_jobs,
      level_audit: u.level_audit,
      level_paper: u.level_paper,
      level_stock: u.level_stock,
    });
  }

  return res.json({
    loggedIn: false,
    level: 0,
    level_jobs: 0,
    level_audit: 0,
    level_paper: 0,
    level_stock: 0,
  });
});

module.exports = router;
