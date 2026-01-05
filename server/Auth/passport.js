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

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        id,
        username,
        display_name,
        level,
        level_jobs,
        level_paper,
        level_audit
      FROM users
      WHERE id = $1
      `,
      [id]
    );

    done(null, rows[0] || null);
  } catch (err) {
    done(err);
  }
});
