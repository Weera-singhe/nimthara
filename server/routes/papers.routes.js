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
  GetPapersFullData,
  GetAllPaperSpecs,
} = require("../Helpers/dbFunc");

const isValidRecAt = (rec_at) =>
  /^\d{4}-\d{2}-\d{2}$/.test(rec_at) &&
  (() => {
    const d = new Date(rec_at + "T00:00:00Z");
    return (
      d.getUTCFullYear() >= 2024 &&
      d.toISOString().slice(0, 10) === rec_at &&
      d <= new Date().setUTCHours(0, 0, 0, 0)
    );
  })();

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

router.post("/:bsns/add", requiredLogged, async (req, res) => {
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
      // new_brand,
    } = req.body;
    const { bsns } = req.params;
    const isGts = bsns === "gts";
    const levelKey = isGts ? "level_paper" : "level_stock";

    // console.log(req.body);
    // console.log("bsns", bsns);
    // console.log("reqbody done");

    const longside = size_h >= size_w ? size_h : size_w;
    const shortside = size_h >= size_w ? size_w : size_h;

    const requiredFields = [
      "type",
      "color",
      "den_unit",
      "unit_type",
      "den",
      "size_w",
      "unit_val",
      "brand",
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

    if (!requiredLevel(req, res, levelKey, 1)) return;

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
      brand,
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
    console.log(newPaper);
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
      "paper_list",
    );

    const papersAfter = await GetPapersFullData();
    res.status(200).json({ success: true, papers: papersAfter });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});
async function getPriceLog(paperId) {
  const priceLogSQL = `
    SELECT *
    FROM paper_price
    WHERE paper_id = $1
    ORDER BY rec_at DESC, price_rec DESC
  `;

  const { rows } = await pool.query(priceLogSQL, [paperId]);
  return rows;
}

router.get("/:bsns/priceLog/:id", requiredLogged, async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const priceLog = await getPriceLog(id);

    res.json({ success: true, priceLog });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/:bsns/price/rec", requiredLogged, async (req, res) => {
  try {
    const { price, id, rec_at } = req.body;

    // console.log(req.body);
    // console.log("reqbody done");
    const paperPrice = Number(price || 0);
    const paperId = Number(id);

    const { bsns } = req.params;
    const isGts = bsns === "gts";
    const recAtValid = isValidRecAt(rec_at);

    if (!paperPrice || paperPrice <= 0 || !recAtValid || !isGts) {
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
      rec_at,
      paperPrice,
    ]);

    const priceLog = await getPriceLog(paperId);

    const user_id = getUserID(req);

    const price_rec = insertRows[0].price_rec;

    await RecActivity(
      user_id,
      "insert",
      "{}",
      insertRows[0],
      "/price/rec",
      paperId,
      price_rec,
      null,
      null,
      "paper_price",
    );

    res.status(200).json({ success: true, priceLog });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

async function getStockLog(paperId, isGts) {
  const switch_ = isGts ? "!" : "";

  const stockLogSQL = `
    SELECT *
    FROM paper_stock
    WHERE paper_id = $1 AND storage ${switch_}= 9
    ORDER BY rec_at DESC, stock_rec DESC
  `;

  const { rows } = await pool.query(stockLogSQL, [paperId]);
  return rows;
}

router.get("/:bsns/stockLog/:id", requiredLogged, async (req, res) => {
  const { bsns, id } = req.params;

  try {
    const isGts = bsns === "gts";
    const stockLog = await getStockLog(id, isGts);

    res.json({ success: true, stockLog });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/:bsns/log/rec", requiredLogged, async (req, res) => {
  try {
    const { change, direction, id, rec_at, storage, storageTo, note, type } =
      req.body;
    console.log(req.body);

    const { bsns } = req.params;
    const isGts = bsns === "gts";
    const safeStorage = isGts ? storage : 9;
    const paperId = Number(id);

    const isTransfer = direction === 0;

    const dirOk = direction === -1 || isTransfer || direction === 1;

    if (!dirOk) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid direction" });
    }

    const changed_x_dir = isTransfer ? change * -1 : change * direction;
    const type_ = isTransfer ? "trn" : type;

    const checkSql = `SELECT * from paper_data where id = $1`;
    const { rows: checkrows } = await pool.query(checkSql, [paperId]);
    if (!checkrows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Paper cannot find" });
    }

    const reducingStorage = !isGts
      ? (checkrows[0]?.stock_nim ?? 0)
      : safeStorage === 1
        ? (checkrows[0]?.stock_a ?? 0)
        : (checkrows[0]?.stock_b ?? 0);

    const moreThanHave = changed_x_dir < 0 && reducingStorage < change;

    if (!change || change <= 0 || moreThanHave || !changed_x_dir) {
      return res
        .status(400)
        .json({ success: false, message: "Negative Stock" });
    }
    const recAtValid = isValidRecAt(rec_at);

    const transferSame = isTransfer && storage === storageTo;
    const nimTransfering = !isGts && isTransfer;

    if (!recAtValid || transferSame || nimTransfering || !type_) {
      return res.status(400).json({
        success: false,
        message: `Invalid field`,
      });
    }

    if (!requiredLevel(req, res, "level_paper", 1)) return;

    const insertSql = `
      INSERT INTO paper_stock (paper_id, rec_at, change, storage, note, type) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `;

    const { rows: insertRows } = await pool.query(insertSql, [
      paperId,
      rec_at,
      changed_x_dir,
      safeStorage,
      note,
      type_,
    ]);

    const stock_rec1 = insertRows[0].stock_rec;
    const user_id = getUserID(req);

    const act = isTransfer ? "transfer" : direction === 1 ? "plus" : "minus";

    await RecActivity(
      user_id,
      act,
      "{}",
      change,
      "/log/rec",
      paperId,
      stock_rec1,
      null,
      null,
      "paper_stock",
    );

    if (!!isTransfer) {
      const { rows: insertRowsT } = await pool.query(insertSql, [
        paperId,
        rec_at,
        change,
        storageTo,
        note,
        type_,
      ]);

      const stock_rec2 = insertRowsT[0].stock_rec;
      await RecActivity(
        user_id,
        act,
        "{}",
        change,
        "/log/rec",
        paperId,
        stock_rec2,
        null,
        null,
        "paper_stock",
      );
    }

    const stockLog = await getStockLog(paperId, isGts);
    const papers = await GetPapersFullData();
    res.status(200).json({ success: true, stockLog, papers });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
