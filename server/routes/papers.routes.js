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
const { dateTimeCon, dateCon } = require("../Helpers/dates");

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
      new_brand,
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
      "unit_type",
      "den",
      "size_w",
      "unit_val",
    ];

    // check presence + > 0
    for (const field of requiredFields) {
      const value = Number(req.body[field]);

      if (value <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid or missing field: ${field}`,
        });
      }
    }

    const addNewBrand = Number(brand) === 0;
    const newBrandName = (new_brand || "").replace(/\s+/g, "");

    if (addNewBrand && !newBrandName) {
      return res.status(400).json({
        success: false,
        message: "Brand name is invalid",
      });
    }

    if (!requiredLevel(req, res, "level_paper", 1)) return;

    let brand_id = brand;

    if (addNewBrand) {
      const addBrSql = `
        INSERT INTO paper_specs (p_brand)
        VALUES ($1)
        RETURNING id
      `;
      const result = await pool.query(addBrSql, [newBrandName]);
      brand_id = result.rows[0].id;
    }

    const insertSql = `
      INSERT INTO paper_list
        (type_, color_, den, size_h, size_w, brand_, unit_val, unit_type, den_unit_)
      SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9
      WHERE NOT EXISTS ( SELECT 1 FROM paper_list
        WHERE type_  = $1
          AND color_ = $2
          AND den    = $3
          AND size_h = $4
          AND size_w = $5
          AND brand_ = $6
      )RETURNING *`;

    const params = [
      type,
      color,
      den,
      shortside,
      longside,
      brand_id,
      unit_val,
      unit_type,
      den_unit,
    ];

    const { rows } = await pool.query(insertSql, params);

    if (rows.length === 0) {
      return res.status(409).json({
        success: false,
        message: "Paper already exists",
      });
    }

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

    const recAtValid =
      Number.isFinite(recDate.getTime()) &&
      recDate.getTime() <= Date.now() + 5.5 * 60 * 60 * 1000;

    if (!paperPrice || paperPrice <= 0 || !recAtValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing field" });
    }

    if (!requiredLevel(req, res, "level_paper", 1)) return;

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

router.get("/stockLog/:id", requiredLogged, async (req, res) => {
  const { id } = req.params;

  try {
    const stockLogSQL = `
      SELECT *, ${dateCon("rec_at")}
      FROM paper_stock
      WHERE paper_id = $1
      ORDER BY rec_at DESC, stock_rec DESC
    `;

    const { rows: stockLog } = await pool.query(stockLogSQL, [id]);

    res.json({ success: true, stockLog });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/log/rec", requiredLogged, async (req, res) => {
  try {
    const { change, direction, id, rec_at, storage, storageTo, dealer, note } =
      req.body;
    console.log(req.body);
    console.log("reqbody done");
    const recDate = new Date(rec_at);
    const paperId = Number(id);

    const isTransfer = direction === 0;
    const changedXdir = isTransfer ? change * -1 : change * direction;

    const dealer_ = isTransfer ? "" : dealer;
    const recAtValid =
      Number.isFinite(recDate.getTime()) &&
      recDate.getTime() <= Date.now() + 5.5 * 60 * 60 * 1000;

    const transferSame = isTransfer && storage === storageTo;

    const checkSql = `SELECT * from paper_data where id = $1`;
    const { rows: checkrows } = await pool.query(checkSql, [paperId]);
    if (!checkrows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Paper cannot find" });
    }

    const minusStock =
      storage === 1 ? checkrows[0]?.stock_a ?? 0 : checkrows[0]?.stock_b ?? 0;
    const moreThan = direction < 1 && minusStock < change;

    if (
      !changedXdir ||
      !recAtValid ||
      transferSame ||
      !change ||
      change <= 0 ||
      moreThan
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid or missing field`,
      });
    }

    if (!requiredLevel(req, res, "level_paper", 1)) return;
    const insertSql = `
      INSERT INTO paper_stock (paper_id, rec_at, change, storage, dealer, note) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `;
    const { rows: insertRows } = await pool.query(insertSql, [
      paperId,
      recDate,
      changedXdir,
      storage,
      dealer_,
      note,
    ]);
    if (!!isTransfer) {
      await pool.query(insertSql, [
        paperId,
        recDate,
        change,
        storageTo,
        dealer_,
        note,
      ]);
    }

    const stockLogSQL = `
      SELECT *, ${dateCon("rec_at")}
      FROM paper_stock
      WHERE paper_id = $1
      ORDER BY rec_at DESC, stock_rec DESC
    `;

    const { rows: stockLog } = await pool.query(stockLogSQL, [id]);

    const user_id = getUserID(req);

    const act = isTransfer ? "transfer" : direction === 1 ? "plus" : "minus";

    await RecActivity(
      user_id,
      act,
      "{}",
      change,
      "/log/rec",
      paperId,
      null,
      null,
      null,
      "paper_stock"
    );

    const papers = await GetPapersFullData();
    res.status(200).json({ success: true, stockLog, papers });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
