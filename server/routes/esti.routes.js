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
} = require("../Helpers/dbFunc");

router.get("/:linkid/:linkat", requiredLogged, async (req, res) => {
  try {
    const { linkid, linkat } = req.params;
    console.log(linkid, linkat);

    if (!requiredLevel(req, res, "level_jobs", 3)) return;

    const { rows } = await pool.query(
      "SELECT * FROM esti WHERE link_id = $1 AND link_at = $2",
      [linkid, linkat]
    );

    const esti = rows[0] || {};

    const getQtsComp = await pool.query(
      `SELECT * FROM jobs_qts ORDER BY id ASC `
    );
    const qtsComps = getQtsComp.rows;

    const allPapers = await GetPapersFullData();

    return res.json({ success: true, esti, qtsComps, allPapers });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/:linkid/:linkat", requiredLogged, async (req, res) => {
  try {
    // console.log(req.body);

    const { linkid, linkat } = req.params;
    const { loops, vals, data, renames } = req.body;

    const user_id = getUserID(req);

    if (!requiredLevel(req, res, "level_jobs", 3)) return;

    const { rows: beforeRows, rowCount: beforeCount } = await pool.query(
      "SELECT * FROM esti WHERE link_id = $1 AND link_at = $2",
      [linkid, linkat]
    );

    const estiBefore = beforeRows[0] || {};
    if (!beforeCount) {
      const insSQL = `
        INSERT INTO esti ( link_id, loops, vals, data, renames, link_at )
        VALUES ($1, $2, $3, $4, $5, $6);
      `;
      await pool.query(insSQL, [linkid, loops, vals, data, renames, linkat]);
    } else {
      const updSQL = `
      UPDATE esti
      SET loops=$1, vals=$2, data=$3, renames=$4
      WHERE link_id = $5 AND link_at = $6
      RETURNING *;
    `;
      await pool.query(updSQL, [loops, vals, data, renames, linkid, linkat]);
    }
    console.log("success");
    const { rows: afterRows } = await pool.query(
      "SELECT * FROM esti WHERE link_id = $1 AND link_at = $2",
      [linkid, linkat]
    );

    const esti = afterRows[0] || {};

    const { old_v, new_v } = WhatzChanged(estiBefore, esti);

    await RecActivity(
      user_id,
      beforeCount ? "update" : "insert",
      old_v,
      new_v,
      "/esti/save",
      linkid,
      linkat,
      "esti",
      null,
      "esti"
    );

    return res.json({ success: true, esti });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
