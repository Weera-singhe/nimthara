const express = require("express");
const router = express.Router();

const pool = require("../Db/pool");
const {
  requiredLogged,
  requiredLevel,
  getUserID,
} = require("../Auth/authcheck");

router.get("/", async (req, res) => {
  try {
    res.json({ success: true });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get("/nim/jticket", async (req, res) => {
  try {
    const { rows: allJobs } = await pool.query(
      `
      SELECT
        jj.*,
        jf.*,
        cs.cus_name_short,
        cs.customer_name
      FROM job_jobs     AS jj
      JOIN job_files    AS jf
        ON jf.file_id   = jj.jobfile_id
      AND jf.hide_file = FALSE
      JOIN customers    AS cs
        ON cs.id        = jf.customer_id
      WHERE jj.hide_job = FALSE 
      AND jj.job_index <= jf.jobs_count
      AND job_status > 0
      `,
    );
    res.json({ success: true, allJobs });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
