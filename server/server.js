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
      ? "https://www.nimthara.com"
      : "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 3,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function GetSpecsEachPaper() {
  return pool
    .query(
      `SELECT id, CONCAT(p_type, ' ', gsm, 'gsm ', size_h, 'x', size_w, ' ', p_brand, ' ', p_color) AS name,
      p_unit AS unit, unit_val FROM paper_specs_ ORDER BY id ASC;`
    )
    .then((result) => result.rows);
}
function GetAllSpecs() {
  return pool
    .query(
      `WITH type_list AS (SELECT p_type, MIN(id) AS min_id FROM paper_specs WHERE p_type IS NOT NULL GROUP BY p_type),
      color_list AS (SELECT p_color, MIN(id) AS min_id FROM paper_specs WHERE p_color IS NOT NULL GROUP BY p_color)
      SELECT json_build_object(
      'types',  (SELECT array_agg(p_type ORDER BY min_id) FROM type_list),
      'colors', (SELECT array_agg(p_color ORDER BY min_id) FROM color_list),
      'brands', (SELECT array_agg(DISTINCT p_brand ORDER BY p_brand)FROM paper_specs WHERE p_brand IS NOT NULL),
      'brand_ids', (SELECT array_agg(id ORDER BY p_brand)FROM paper_specs WHERE p_brand IS NOT NULL),
      'units', (SELECT array_agg(DISTINCT p_unit ORDER BY p_unit) FROM paper_specs WHERE p_unit IS NOT NULL)) AS result`
    )
    .then((res) => res.rows[0].result);
}

function GetPrices(id) {
  return pool
    .query(
      `SELECT TO_CHAR(date, 'YYYY-MM-DD') AS date_ , price FROM paper_price WHERE price_id = $1 ORDER BY date DESC`,
      [id]
    )
    .then((result) => {
      return result.rows;
    });
}

function GetLatestPrice() {
  return pool
    .query(
      `SELECT (SELECT price FROM paper_price pp WHERE pp.price_id = p.id
     ORDER BY date DESC, price_rec DESC LIMIT 1) AS price FROM papers p ORDER BY p.id;`
    )
    .then((result) => result.rows.map((i) => i.price));
}

async function GetDatePrice(id, date) {
  const result = await pool.query(
    `SELECT price FROM paper_price WHERE price_id = $1
     AND date <= $2 ORDER BY date DESC, price_rec DESC LIMIT 1`,
    [id, date]
  );

  return result.rows[0]?.price ?? null;
}

function GetStocks(id) {
  return pool
    .query(
      `SELECT *, TO_CHAR(date, 'YYYY-MM-DD') AS date_ FROM paper_stock WHERE stock_id = $1 ORDER BY date`,
      [id]
    )
    .then((result) => {
      return result.rows;
    });
}
function GetCustomers() {
  return pool
    .query(
      "SELECT *, TO_CHAR(reg_till, 'YYYY-MM-DD') AS reg_till_ FROM customers ORDER BY customer_name ASC"
    )
    .then((result) => {
      return result.rows;
    });
}
function GetClients() {
  return pool
    .query("SELECT * FROM gts_clients ORDER BY client_name ASC")
    .then((result) => {
      return result.rows;
    });
}

async function GetEachNLatestP() {
  const eachPaper = await GetSpecsEachPaper();
  const latestPrices = await GetLatestPrice();

  return eachPaper.map((p, i) => ({
    ...p,
    latest_price: latestPrices[i] ?? 0,
  }));
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
    const papers = await GetEachNLatestP();
    const data = await GetAllSpecs();

    res.json({ papers, data });
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
      type_,
      color_,
      gsm,
      size_h,
      size_w,
      brand_,
      unit_val,
      unit_,
    ]);

    const papers = await GetEachNLatestP();
    res.status(201).json({ success: true, papers });
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
    const papers = await GetEachNLatestP();

    res.json({ papers });
  } catch (err) {
    console.error("Error fetching papers:", err);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

app.get("/price", async (req, res) => {
  try {
    const eachpaper = await GetSpecsEachPaper();
    const id = req.query.id;
    const recs = await GetPrices(id);
    res.json({ eachpaper, recs });
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
app.get("/stock", async (req, res) => {
  try {
    const { id, date } = req.query;

    const recs = await GetStocks(id);
    const papers = await GetEachNLatestP();
    const c = await GetClients();
    const booksResult = await pool.query("SELECT * FROM gts_books ORDER by id");
    const books = booksResult.rows;

    const priceForDate =
      id && date ? await GetDatePrice(id, `${date} 23:59:59`) : null;

    res.json({ papers, recs, c, books, priceForDate });
  } catch (err) {
    console.error("Error fetching papers:", err);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

app.post("/rec_new_stock", async (req, res) => {
  const { change, date, des, direction, invoice_id, rec_id } = req.body;

  try {
    // await pool.query(
    //   "INSERT INTO paper_stock (stock_id, date, des,change,invoice_id)VALUES ($1,$2,$3,$4,$5)",
    //    [rec_id, date, des, change * direction, invoice_id]
    //  );
    const recs = await GetStocks(rec_id);
    res.status(201).json({ success: true, recs });
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/cus", async (req, res) => {
  try {
    const cus = await GetCustomers();
    res.json(cus);
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});
app.post("/add_new_cus", async (req, res) => {
  const {
    id,
    customer_name,
    cus_name_short,
    cus_name_other,
    reg_must,
    reg_till_,
  } = req.body;
  try {
    if (id) {
      await pool.query(
        `UPDATE customers SET customer_name = $1, cus_name_short = $2, cus_name_other = $3,
         reg_must = $4, reg_till = $5 WHERE id = $6`,
        [customer_name, cus_name_short, cus_name_other, reg_must, reg_till_, id]
      );
    } else {
      await pool.query(
        `INSERT INTO customers (customer_name, cus_name_short, cus_name_other, reg_must, reg_till)
         VALUES ($1, $2, $3, $4, $5)`,
        [customer_name, cus_name_short, cus_name_other, reg_must, reg_till_]
      );
    }
    const cus = await GetCustomers();
    res.status(201).json({ success: true, cus });
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/gts/clients", async (req, res) => {
  try {
    const c = await GetClients();
    res.json(c);
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

app.post("/gts/add_new_clients", async (req, res) => {
  const { id, client_name, is_buyer, is_supplier, has_vat, vat_id } = req.body;
  try {
    if (id) {
      await pool.query(
        `UPDATE gts_clients SET client_name = $1, is_buyer = $2, is_supplier = $3,
         has_vat = $4, vat_id = $5 WHERE id = $6`,
        [client_name, is_buyer, is_supplier, has_vat, vat_id, id]
      );
    } else {
      await pool.query(
        `INSERT INTO gts_clients (client_name, is_buyer, is_supplier, has_vat,vat_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [client_name, is_buyer, is_supplier, has_vat, vat_id]
      );
    }
    const c = await GetClients();
    res.status(201).json({ success: true, c });
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
    req.login(user, () => {
      res.json({
        success: true,
        user: {
          username: user.username,
          level: user.level,
          display_name: user.display_name,
        },
      });
    });
  })(req, res, next);
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
app.post("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid", {
        path: "/",
        sameSite: "none",
        secure: true,
      });
      res.status(200).json({ success: true });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
