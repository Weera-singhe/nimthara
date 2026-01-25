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
router.get("/nim/jticket/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const safeId = Number(id || 0);
    const { rows: qualiJobs } = await pool.query(
      `
      SELECT
        jj.job_id,
        jj.jobfile_id,
        jj.job_index,
        jf.customer_id,
        jf.unreg_customer,
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
      AND jj.job_status>0
      `,
    );

    const { rows: selectedJobs } = await pool.query(
      `  
      SELECT
        jj.*,
        jf.*,
        cs.cus_name_short,
        cs.customer_name,
        est.*
      FROM job_jobs     AS jj
      JOIN job_files    AS jf
        ON jf.file_id   = jj.jobfile_id AND jf.hide_file = FALSE
      JOIN customers    AS cs
        ON cs.id        = jf.customer_id
      JOIN esti    AS est
        ON est.link_id = jj.job_id::text AND est.link_at = 'jobs_pre'
      WHERE jj.hide_job = FALSE 
      AND jj.job_index <= jf.jobs_count
      AND jj.job_status>0 
      AND jj.job_id = $1
      `,
      [safeId],
    );

    const selectedJ = selectedJobs[0] || null;

    res.json({ success: true, qualiJobs, selectedJ });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
