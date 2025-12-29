const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const pool = require("../Db/pool");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1 AND reg_done = true",
        [username]
      );

      if (!result.rows.length) return done(null, false);

      const user = result.rows[0];
      if (user.password !== password) return done(null, false);

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// CHANGED HERE: store a minimal user snapshot in session
passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    display_name: user.display_name,
    level: user.level,
    level_jobs: user.level_jobs,
    level_paper: user.level_paper,
    level_audit: user.level_audit,
  });
});

// CHANGED HERE: no DB hit on every request
passport.deserializeUser((user, done) => {
  done(null, user);
});
