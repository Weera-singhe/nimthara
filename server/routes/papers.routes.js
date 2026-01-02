const express = require("express");
const router = express.Router();

const pool = require("../Db/pool");
const {
  requiredLogged,
  requiredLevel,
  getUserID,
} = require("../Auth/authcheck");
const {
  RecActivity,
  WhatzChanged,
  GetPapersFullData,
  GetAllPaperSpecs,
} = require("../Helpers/dbFunc");
const { dateTimeCon } = require("../Helpers/dates");

router.get("/", async (req, res) => {
  try {
    const specs = await GetAllPaperSpecs();
    const papers = await GetPapersFullData();
    res.json({ success: true, papers, specs });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/add", requiredLogged, async (req, res) => {
  try {
    const {
      color,
      den_unit,
      brand,
      unit_type,
      den,
      size_h,
      size_w,
      unit_val,
      type,
    } = req.body;

    // console.log(req.body);
    // console.log("reqbody done");

    const longside = size_h >= size_w ? size_h : size_w;
    const shortside = size_h >= size_w ? size_w : size_h;
    // console.log("shortside", shortside);
    // console.log("longside", longside);
    // console.log("end");

    const requiredFields = [
      "type",
      "color",
      "den_unit",
      "brand",
      "unit_type",
      "den",
      "size_w",
      "unit_val",
    ];

    // check presence + > 0
    for (const field of requiredFields) {
      const value = Number(req.body[field] || 0);

      if (!value) {
        return res.status(400).json({
          success: false,
          message: `Invalid or missing field: ${field}`,
        });
      }
    }

    if (!requiredLevel(req, res, "level_paper", 2)) return;

    const insertSql = `
      INSERT INTO paper_list
        (type_, color_, den, size_h, size_w, brand_, unit_val, unit_type, den_unit_)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (type_, color_, den, size_h, size_w, brand_ )
      DO NOTHING
      RETURNING *;
    `;

    const params = [
      type,
      color,
      den,
      shortside,
      longside,
      brand,
      unit_val,
      unit_type,
      den_unit,
    ];

    const { rows } = await pool.query(insertSql, params);

    // if (rows.length === 0) {
    //   return res.status(409).json({
    //     success: false,
    //     message: "Paper already exists",
    //   });
    // }

    const newPaper = rows[0];
    const user_id = getUserID(req);

    await RecActivity(
      user_id,
      "insert",
      "{}",
      { id: newPaper?.id },
      "/papers/add",
      newPaper?.id,
      null,
      null,
      null,
      "paper_list"
    );

    const papersAfter = await GetPapersFullData();
    res.status(200).json({ success: true, papers: papersAfter });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get("/priceLog/:id", requiredLogged, async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const priceLogSQL = `
      SELECT *, ${dateTimeCon("rec_at")}
      FROM paper_price
      WHERE paper_id = $1
      ORDER BY rec_at DESC
    `;

    const { rows: priceLog } = await pool.query(priceLogSQL, [id]);

    res.json({ success: true, priceLog });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/price/rec", requiredLogged, async (req, res) => {
  try {
    const { price, id, rec_at } = req.body;

    console.log(req.body);
    console.log("reqbody done");
    const paperPrice = Number(price || 0);
    const recDate = new Date(rec_at);
    const paperId = Number(id);

    const recAtValid = recDate <= new Date();

    if (!paperPrice || !recAtValid) {
      return res.status(400).json({
        success: false,
        message: `Invalid or missing field`,
      });
    }

    if (!requiredLevel(req, res, "level_paper", 2)) return;

    const checkSql = `SELECT * from paper_list where id = $1`;
    const { rows: checkrows } = await pool.query(checkSql, [paperId]);
    if (!checkrows.length) {
      return res.status(404).json({ success: false, message: "Wrong Paper" });
    }

    const insertSql = `
      INSERT INTO paper_price (paper_id, rec_at, price) VALUES ($1,$2,$3) RETURNING *
    `;
    const { rows: insertRows } = await pool.query(insertSql, [
      paperId,
      recDate,
      paperPrice,
    ]);

    const priceLogSQL = `
      SELECT *, ${dateTimeCon("rec_at")}
      FROM paper_price
      WHERE paper_id = $1
      ORDER BY rec_at DESC
    `;

    const { rows: priceLog } = await pool.query(priceLogSQL, [paperId]);

    const user_id = getUserID(req);

    await RecActivity(
      user_id,
      "insert",
      "{}",
      insertRows[0],
      "/price/rec",
      paperId,
      null,
      null,
      null,
      "paper_price"
    );

    res.status(200).json({ success: true, priceLog });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
