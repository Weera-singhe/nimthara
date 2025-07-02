const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://nimthara.com"
      : "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 3 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function GetIdsNames() {
  return pool
    .query(
      `SELECT p.id, p.gsm,t.type, p.size_h, p.size_w, b.brand, c.color
      FROM papers p JOIN types  t ON p.type_  = t.type_id
      JOIN brands b ON p.brand_ = b.brand_id JOIN colors c ON p.color_ = c.color_id
      ORDER BY p.id ASC`
    )
    .then((result) => {
      const ids = result.rows.map((i) => i.id);
      const names = result.rows.map(
        (i) =>
          `${i.type} ${i.gsm}gsm ${i.size_h}x${i.size_w} ${i.brand} ${i.color}`
      );
      return { ids, names };
    });
}

function GetPrices(id) {
  return pool
    .query(
      `SELECT TO_CHAR(date, 'YYYY-MM-DD') AS date_ , price
     FROM paper_price
     WHERE price_id = $1 ORDER BY date DESC`,
      [id]
    )
    .then((result) => {
      return result.rows;
    });
}

function GetLatestPrice() {
  return pool
    .query(
      `SELECT COALESCE(pp.price, 0) AS price
       FROM papers p LEFT JOIN (SELECT DISTINCT ON (price_id)
      price_id,price FROM paper_price ORDER BY price_id, date DESC)
      pp ON p.id = pp.price_id ORDER BY p.id ASC;`
    )
    .then((result) => result.rows.map((i) => i.price));
}

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Welcome to the Nimthara backend",
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/papers", async (req, res) => {
  try {
    const { ids, names } = await GetIdsNames();
    const result = await pool.query(`SELECT json_build_object(
    'types',  (SELECT array_agg(type ORDER BY type_id)  FROM types),
    'colors', (SELECT array_agg(color) FROM colors),
   'brands', (SELECT array_agg(brand ORDER BY brand ASC) FROM brands),
   'brand_ids', (SELECT array_agg(brand_id ORDER BY brand ASC) FROM brands),
   'units', (SELECT array_agg(unit) FROM units)) AS result;`);
    const data = result.rows[0].result;
    const latestPrices = await GetLatestPrice();

    res.json({ ids, names, data, latestPrices });
  } catch (err) {
    console.error("Error fetching papers:", err);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

app.post("/add_new_paper", async (req, res) => {
  const { brand_, color_, gsm, id, size_h, size_w, type_, unit_, unit_val } =
    req.body;
  try {
    await pool.query("INSERT INTO papers VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)", [
      id,
      +type_,
      +color_,
      +gsm,
      +size_h,
      +size_w,
      +brand_,
      +unit_val,
      +unit_,
    ]);
    const { ids, names } = await GetIdsNames();
    res.status(201).json({ success: true, names: names });
  } catch (err) {
    console.error("DB Error:", err.message);
    if (err.code === "23505") {
      res
        .status(400)
        .json({ success: false, message: "This paper already exists." });
    } else {
      res.status(500).json({ success: false, message: err.message });
    }
  }
});

app.get("/quotation", async (req, res) => {
  try {
    const { ids, names } = await GetIdsNames();
    const latestPrices = await GetLatestPrice();

    res.json({ names, latestPrices });
  } catch (err) {
    console.error("Error fetching papers:", err);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

app.get("/price", async (req, res) => {
  try {
    const { ids, names } = await GetIdsNames();
    const id = req.query.id;
    const recs = await GetPrices(id);
    res.json({ ids, names, recs });
  } catch (err) {
    console.error("Error fetching papers:", err);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});
app.post("/rec_new_price", async (req, res) => {
  const { id, from, price } = req.body;

  try {
    await pool.query(
      "INSERT INTO paper_price (price_id, date, price)VALUES ($1,$2,$3)",
      [id, from, +price]
    );
    const recs = await GetPrices(id);
    res.status(201).json({ success: true, recs });
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/userregister", async (req, res) => {
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
app.post("/userlogin", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (!user) return res.status(401).json({ success: false });

    req.login(user, () => res.json({ success: true }));
  })(req, res, next);
});

app.post("/logout", (req, res) => {
  req.logout(() => {
    res.json({ success: true, message: "Logged out" });
  });
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1 AND reg_done = true",
        [username]
      );

      if (result.rows.length === 0) {
        return done(null, false, { message: "Incorrect username." });
      }
      const user = result.rows[0];
      if (user.password !== password) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser(async (username, done) => {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  done(null, result.rows[0]);
});

app.get("/check-auth", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      loggedIn: true,
      username: req.user.username,
      level: req.user.level,
      display_name: req.user.display_name,
    });
  } else {
    res.json({ loggedIn: false, level: 0 });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
