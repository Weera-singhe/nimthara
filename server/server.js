const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

function GetSelectedPriceRecs(id) {
  return pool
    .query(
      `SELECT TO_CHAR(date, 'YYYY-MM-DD') AS date,price
    FROM paper_price JOIN papers ON papers.id = paper_price.price_id
    where price_id = $1 ORDER BY date ASC; `,
      [id]
    )
    .then((result) => {
      return result.rows;
    });
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

    res.json({ names, data });
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

    res.json({ names });
  } catch (err) {
    console.error("Error fetching papers:", err);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

app.get("/price", async (req, res) => {
  try {
    const { ids, names } = await GetIdsNames();
    const id = req.query.id;
    const recs = await GetSelectedPriceRecs(id);
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
    const recs = await GetSelectedPriceRecs(id);
    res.status(201).json({ success: true, selectedRecs: recs });
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
