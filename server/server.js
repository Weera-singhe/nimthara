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

//CLOUD      /////////////////////////////////////////

const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const fs = require("fs/promises");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const upload = multer({ dest: "temp_uploads/" });

//SQL FUNCTIONS      //////////////////////////////////

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

//OTHER FUNCTIONS      ////////////////////////////////////////

function getDateYYMMDD() {
  const d = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" })
  );
  return d.toISOString().slice(2, 10).replace(/-/g, "");
}

//HOME      ////////////////////////////////////////////////////

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

//PAPER      /////////////////////////////////////

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

//JOBS      /////////////////////////////

app.get("/jobs", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT *,TO_CHAR(created_at, 'YYMMDD') AS created_at FROM jobs ORDER BY id DESC"
    );
    const jobs = result.rows;
    const cus = await GetCustomers();
    res.json({ jobs, cus });
  } catch (err) {
    res.status(500).send("Error");
  }
});

app.get("/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cus = await GetCustomers();

    if (id === "add") {
      return res.json({ cus });
    }

    const result1 = await pool.query(
      `SELECT *, TO_CHAR(deadline, 'YYYY-MM-DD"T"HH24:MI') AS deadline,TO_CHAR(created_at, 'YYMMDD') AS created_at,TO_CHAR(created_at, 'YYYY-MM-DD @ HH24:MI') AS created_at_
       FROM jobs WHERE id = $1`,
      [id]
    );
    const result2 = await pool.query(
      `SELECT *,TO_CHAR(created_at, 'YYYY-MM-DD @ HH24:MI') AS created_at_ FROM jobs_each WHERE id_main = $1`,
      [id]
    );
    const result3 = await pool.query(
      `SELECT * FROM jobs_each WHERE id_main = 0 AND id_each=0`
    );

    const result4 = await pool.query(
      `SELECT json_build_object('loop_count',(SELECT json_object_agg(name,def_loop_count)FROM jobs_qts),'v',
      (SELECT json_object_agg(name || '_' || (i - 1) || '_' || (j - 1),val)FROM jobs_qts,generate_series(1, max)
      AS i,LATERAL unnest(def_v) WITH ORDINALITY AS a(val, j)),'notes_other',(SELECT json_object_agg(
      'Other_' || i, '')FROM generate_series(0,(SELECT max FROM jobs_qts WHERE name = 'Other')-1)AS i))AS result;`
    );
    const result5 = await pool.query(`SELECT * FROM jobs_qts ORDER BY id ASC `);
    const result6 = await pool.query(`SELECT * FROM users ORDER BY id ASC `);

    const job_details = result1.rows[0];
    const comp_defs = result4.rows[0].result;
    const qts_componants = result5.rows;
    const jobs_each = (result2.rows || []).map((row) => ({
      ...row,
      profit: Number(row.profit) || 0,
    }));

    const def_jobs_each = {
      ...result3.rows[0],
      profit: Number(result3.rows[0].profit),
    };
    console.log(jobs_each);

    const usernames = result6.rows.map((r) => r.username);

    const allPapers = await GetEachNLatestP();
    res.json({
      job_details,
      cus,
      jobs_each,
      def_jobs_each,
      comp_defs,
      qts_componants,
      allPapers,
      usernames,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("Error");
  }
});

app.post("/jobs/div1", async (req, res) => {
  try {
    const { id, customer, reference, deadline, total_jobs, user_id } = req.body;
    console.log(req.body);

    let load_this_id;

    if (id) {
      await pool.query(
        "UPDATE jobs SET customer = $1,reference=$2, deadline = $3,total_jobs=$4 WHERE id = $5",
        [customer, reference, deadline, total_jobs, id]
      );
      load_this_id = id;
    } else {
      const result = await pool.query(
        "INSERT INTO jobs (customer,reference, deadline,total_jobs,created_by) VALUES ($1, $2,$3,$4,$5) RETURNING id",
        [customer, reference, deadline, total_jobs, user_id]
      );
      load_this_id = result.rows[0].id;
    }
    res.status(200).json({ success: true, load_this_id });
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).send("Error saving job");
  }
});
app.post("/jobs/div3", async (req, res) => {
  try {
    const {
      id_main,
      id_each,
      item_count,
      unit_count,
      loop_count,
      v,
      notes_other,
      profit,
      user_id,
    } = req.body;
    console.log(req.body);

    const upd = await pool.query(
      `UPDATE jobs_each SET item_count = $1,unit_count = $2, loop_count=$3, v=$4,notes_other=$5,profit=$6 WHERE id_main  = $7 AND id_each  = $8 RETURNING *`,
      [
        item_count,
        unit_count,
        loop_count,
        v,
        notes_other,
        profit,
        id_main,
        id_each,
      ]
    );

    if (upd.rowCount === 0) {
      await pool.query(
        `INSERT INTO jobs_each (id_main, id_each, item_count, unit_count,loop_count,v,notes_other,profit,created_by)VALUES ($1, $2, $3, $4,$5,$6,$7,$8,$9)`,
        [
          id_main,
          id_each,
          item_count,
          unit_count,
          loop_count,
          v,
          notes_other,
          profit,
          user_id,
        ]
      );
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).send("Error saving job");
  }
});

//PRICE       //////////////////////////////////////////

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

//STOCK      //////////////////////////

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

//CUSTOMERS      /////////////////////////////////////

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

//CLIENTS      /////////////////////////

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

//LOGIN and REGISTER      ///////////////////////////

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
        user: user,
      });
    });
  })(req, res, next);
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

//CACHEE and COOKIES      ///////////////////

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
      ...req.user,
    });
  } else {
    res.json({ loggedIn: false, level: 0, level_jobs: 0 });
  }
});

//
//UPLOAD      //////////////////////////////////////////////////////

app.post("/upload/:id", upload.array("files"), async (req, res) => {
  const { id } = req.params;
  const folderName = req.body.folder_name || "doc";
  const prefix = req.body.prefix + "_" || "";
  console.log(req.body);
  console.log(req.files);

  try {
    await Promise.all(
      req.files.map(async (file) => {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: folderName,
          resource_type: "auto",
          public_id: `${prefix}${file.originalname}_${Date.now()}`,
        });

        await fs.unlink(file.path);

        await pool.query(
          "INSERT INTO uploaded_docs (id, filename, url, public_id, format) VALUES ($1, $2, $3, $4, $5)",
          [
            id,
            prefix + file.originalname.replace(/\.[^/.]+$/, ""),
            uploadResult.secure_url,
            uploadResult.public_id,
            uploadResult.format,
          ]
        );
      })
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "upload failed" });
  }
});

app.get("/upload/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT filename, url AS secure_url, public_id, format FROM uploaded_docs WHERE id = $1",
      [id]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "fetch failed" });
  }
});

app.delete("/upload/:public_id", async (req, res) => {
  const { public_id } = req.params;
  try {
    await cloudinary.uploader.destroy(public_id);
    await pool.query("DELETE FROM uploaded_docs WHERE public_id = $1", [
      public_id,
    ]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "delete failed" });
  }
});

//
//PORT      ////////////////////////////////////////////////

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
