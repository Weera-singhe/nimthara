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

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

app.get("/papers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.gsm, t.type, p.size_h, p.size_w, b.brand, c.color
      FROM papers p
      JOIN types t ON p.type_ = t.type_id
      JOIN brands b ON p.brand_ = b.brand_id
      JOIN colors c ON p.color_ = c.color_id
      ORDER BY p.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching papers:", err);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

// Route to add a new paper
app.post("/add_new_paper", async (req, res) => {
  const { type, color, brand, gsm, sizeH, sizeW, id, unitVal, unit } = req.body;
  try {
    await pool.query("INSERT INTO papers VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)", [
      id,
      +type,
      +color,
      +gsm,
      +sizeH,
      +sizeW,
      +brand,
      +unitVal,
      +unit,
    ]);
    res.status(201).json({ success: true });
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
