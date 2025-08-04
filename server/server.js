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

const upload = multer({ dest: "temp_uploads" });

//SQL FUNCTIONS      //////////////////////////////////

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function GetAllPaperSpecs() {
  const p_brand = await pool.query(`
    SELECT id, COALESCE(p_brand, '') AS name FROM paper_specs
    WHERE p_brand IS NOT NULL ORDER BY p_brand COLLATE "C"`);
  const p_type = await pool.query(`
    SELECT id, COALESCE(p_type, '') AS name FROM paper_specs
    WHERE p_type IS NOT NULL ORDER BY id`);
  const p_color = await pool.query(`
    SELECT id, COALESCE(p_color, '') AS name FROM paper_specs
    WHERE p_color IS NOT NULL ORDER BY id`);
  const p_unit = await pool.query(`
    SELECT id, COALESCE(p_unit, '') AS name FROM paper_specs
    WHERE p_unit IS NOT NULL ORDER BY id`);
  const p_den_unit = await pool.query(`
    SELECT id, COALESCE(p_den_unit, '') AS name FROM paper_specs
    WHERE p_den_unit IS NOT NULL ORDER BY id`);

  return {
    brands: p_brand.rows,
    types: p_type.rows,
    colors: p_color.rows,
    units: p_unit.rows,
    den_unit: p_den_unit.rows,
  };
}

function GetPrices(id) {
  return pool
    .query(
      `SELECT TO_CHAR(date, 'YYYY-MM-DD') AS date_ , price FROM paper_price WHERE paper_id = $1 ORDER BY date DESC`,
      [id]
    )
    .then((result) => {
      return result.rows;
    });
}

async function GetDatePrice(id, date) {
  const result = await pool.query(
    `SELECT price FROM paper_price WHERE paper_id = $1
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
      `SELECT 
      *,
      TO_CHAR(reg_till, 'YYYY-MM-DD') AS reg_till_
      FROM customers
      ORDER BY customer_name ASC`
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
// id, name, unit,unit_val, latest_price,
async function GetPapersFullData() {
  const specs = await pool.query(`
    SELECT id, CONCAT(p_type, ' ', den,p_den_unit,' ', size_h, 'x', size_w,
    ' ', p_brand, ' ', p_color) AS name,
    p_unit AS unit, unit_val,latest_price FROM paper_specs_`);
  return specs.rows;
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
    const specs = await GetAllPaperSpecs();
    const papers = await GetPapersFullData();
    res.json({ papers, specs });
  } catch (err) {
    console.error("Error fetching papers:", err);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

app.post("/add_new_paper", async (req, res) => {
  const {
    brand_,
    color_,
    den_,
    size_h,
    size_w,
    type_,
    unit_,
    unit_val,
    den_unit,
  } = req.body;
  try {
    await pool.query(
      `INSERT INTO papers 
      (type_, color_, den, size_h, size_w, brand_, unit_val, unit_, den_unit_)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [type_, color_, den_, size_h, size_w, brand_, unit_val, unit_, den_unit]
    );

    const papers = await GetPapersFullData();
    res.status(201).json({ success: true, papers });
    console.log(req.body);
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
      "SELECT *,TO_CHAR(created_at, 'YYMMDD') AS created_at FROM jobs WHERE private=false ORDER BY id DESC"
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

    //   continue if no a add ...........
    //main job data
    const {
      rows: [mainJobData],
    } = await pool.query(
      `SELECT
      *,
      TO_CHAR(deadline, 'YYYY-MM-DD"T"HH24:MI') AS deadline,
      TO_CHAR(created_at, 'YYMMDD') AS created_at,
      TO_CHAR(created_at, 'YYYY-MM-DD @ HH24:MI') AS created_at_
      FROM jobs WHERE id = $1 AND private=false`,
      [id]
    );
    //saved job data
    const { rows: getSavedJobs } = await pool.query(
      `
      SELECT 
      je.*,
      TO_CHAR(je.created_at, 'YYYY-MM-DD @ HH24:MI') AS created_at_,
      TO_CHAR(je.last_qt_edit_at, 'YYYY-MM-DD @ HH24:MI') AS last_qt_edit_at_
      FROM jobs_each je
      JOIN jobs j ON je.id_main = j.id
      WHERE je.id_main = $1 AND j.private = false
      ORDER BY je.id_each ASC`,
      [id]
    );
    const savedEachJob = getSavedJobs.map((row) => ({
      ...row,
      profit: Number(row.profit) || 0,
    }));

    //qts componants
    const getQtsComp = await pool.query(
      `SELECT * FROM jobs_qts ORDER BY id ASC `
    );
    const qtsComps = getQtsComp.rows;

    const loop_count = {};
    const v = {};
    const notes_other = {};

    for (const row of qtsComps) {
      const { name, def_loop_count, def_v, max } = row;
      loop_count[name] = def_loop_count;

      for (let i = 0; i < max; i++) {
        for (let j = 0; j < def_v.length; j++) {
          const key = `${name}_${i}_${j}`;
          v[key] = def_v[j];
        }
      }

      if (name === "Other") {
        for (let i = 0; i < max; i++) {
          notes_other[`Other_${i}`] = "";
        }
      }
    }
    const qtsDefsEachJob = { loop_count, v, notes_other };

    //user names
    const usernames = (
      await pool.query(
        `SELECT INITCAP(username) AS username FROM users ORDER BY id ASC`
      )
    ).rows.map((r) => r.username);
    //all paper data
    const allPapers = await GetPapersFullData();

    ////////
    res.json({
      cus,
      mainJobData,
      savedEachJob,
      qtsDefsEachJob,
      qtsComps,
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
app.post("/jobs/div2", async (req, res) => {
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
      deployed,
      cus_id_each,
    } = req.body;
    console.log(req.body);

    // Try updating the existing job
    const upd = await pool.query(
      `UPDATE jobs_each
       SET item_count = $1,
           unit_count = $2,
           loop_count = $3,
           v = $4,
           notes_other = $5,
           profit = $6,
           last_qt_edit_by = $7,
           last_qt_edit_at = NOW(),
           deployed = $8,
           cus_id_each=$9
       WHERE id_main = $10 AND id_each = $11
       RETURNING 
         *,
         TO_CHAR(created_at, 'YYYY-MM-DD @ HH24:MI') AS created_at_,
         TO_CHAR(last_qt_edit_at, 'YYYY-MM-DD @ HH24:MI') AS last_qt_edit_at_`,
      [
        item_count,
        unit_count,
        loop_count,
        v,
        notes_other,
        profit,
        user_id,
        deployed,
        cus_id_each,
        id_main,
        id_each,
      ]
    );

    let result;

    if (upd.rowCount === 0) {
      const insert_result = await pool.query(
        `INSERT INTO jobs_each (
            id_main, id_each, item_count, unit_count,
            loop_count, v, notes_other, profit,
            created_by, last_qt_edit_by, last_qt_edit_at,cus_id_each
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9, NOW(),$10)
         RETURNING 
           *,
           TO_CHAR(created_at, 'YYYY-MM-DD @ HH24:MI') AS created_at_,
           TO_CHAR(last_qt_edit_at, 'YYYY-MM-DD @ HH24:MI') AS last_qt_edit_at_`,
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
          cus_id_each,
        ]
      );

      result = insert_result.rows[0];
    } else {
      result = upd.rows[0];
    }

    const safeResult = {
      ...result,
      profit: Number(result?.profit) || 0,
    };

    res.status(200).json(safeResult);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).send("Error saving job");
  }
});

app.post("/jobs/div3", async (req, res) => {
  try {
    const { submit_method, submit_note1, submit_note2, user_id, id, form } =
      req.body;
    console.log(req.body);
    if (form === "form1") {
      const upd = await pool.query(
        `UPDATE jobs SET
      submit_method = $1,
      submit_note1 = $2,
      submit_note2 = $3
      WHERE id = $4 AND private=false
      RETURNING
       *,
      TO_CHAR(deadline, 'YYYY-MM-DD"T"HH24:MI') AS deadline,
      TO_CHAR(created_at, 'YYMMDD') AS created_at,
      TO_CHAR(created_at, 'YYYY-MM-DD @ HH24:MI') AS created_at_`,
        [submit_method, submit_note1.trim(), submit_note2.trim(), id]
      );
      const updtd = upd.rows[0];
      res.status(200).json(updtd);
    }
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).send("Error saving job");
  }
});

//PRICE       //////////////////////////////////////////

app.get("/price", async (req, res) => {
  try {
    const eachpaper = await GetPapersFullData();
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
      "INSERT INTO paper_price (paper_id, date, price)VALUES ($1,$2,$3)",
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
    const papers = await GetPapersFullData();
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

  //console.log("Upload started:", { id, folderName, prefix });
  //console.log("Files received:", req.files);

  try {
    await Promise.all(
      req.files.map(async (file) => {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: folderName,
          resource_type: "auto",
          public_id: `${prefix}${file.originalname}_${Date.now()}`,
        });

        try {
          await fs.unlink(file.path); // safely clean up temp file
        } catch (err) {
          console.warn("Temp file deletion failed:", file.path, err.message);
        }

        await pool.query(
          `INSERT INTO uploaded_docs (id, filename, url, public_id, format)
           VALUES ($1, $2, $3, $4, $5)`,
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
  } catch (err) {
    console.error("Upload failed:", err.message);
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

app.delete("/upload/:encoded_id", async (req, res) => {
  const public_id = decodeURIComponent(req.params.encoded_id);
  try {
    await cloudinary.uploader.destroy(public_id);
    await pool.query("DELETE FROM uploaded_docs WHERE public_id = $1", [
      public_id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

//PORT      ////////////////////////////////////////////////

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
