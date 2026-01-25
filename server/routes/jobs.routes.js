const express = require("express");
const router = express.Router();

const pool = require("../Db/pool");
const {
  requiredLogged,
  requiredLevel,
  getUserID,
} = require("../Auth/authcheck");
const { dateTimeInpCon } = require("../Helpers/dates");
const { RecActivity, WhatzChanged } = require("../Helpers/dbFunc");

router.get("/", requiredLogged, async (req, res) => {
  try {
    const { rows: allJobFiles } = await pool.query(
      `
      SELECT
        jf.*,
        cs.cus_name_short,
        cs.customer_name,
        COALESCE(jj.esti_ok_all, FALSE) AS esti_ok_all,
        (jf.bid_submit ->> 'method')::int = 5 AS notbidding
      FROM job_files jf
      JOIN customers cs
        ON cs.id = jf.customer_id
      LEFT JOIN (
        SELECT
          jj.jobfile_id,
          bool_and(
            COALESCE( (jj.job_info ->> 'esti_ok')::boolean, FALSE )
          ) AS esti_ok_all
        FROM job_jobs jj
        JOIN job_files jf2
          ON jf2.file_id = jj.jobfile_id
        AND jj.job_index <= jf2.jobs_count
        GROUP BY jj.jobfile_id
      ) jj
        ON jj.jobfile_id = jf.file_id
      WHERE jf.hide_file = FALSE
      `,
    );
    const { rows: qualiJobs } = await pool.query(
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
      AND jj.job_status>0
      `,
    );
    const { rows: allJobsSearch } = await pool.query(
      `
      SELECT
        jf.*,
        cs.cus_name_short,
        cs.customer_name,
        jj.*,
        gs.job_index AS job_index_base  
      FROM job_files AS jf
      JOIN customers AS cs
        ON cs.id = jf.customer_id
      JOIN LATERAL generate_series(1, jf.jobs_count) AS gs(job_index)
        ON TRUE
      LEFT JOIN job_jobs AS jj
        ON jj.jobfile_id = jf.file_id
      AND jj.job_index  = gs.job_index
      AND jj.hide_job   = FALSE
      WHERE jf.hide_file = FALSE
      `,
    );
    res.json({ allJobFiles, qualiJobs, allJobsSearch });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

const GetJobFile_SQL = `
      SELECT
      *,
      ${dateTimeInpCon("bid_deadline")}
      FROM job_files
      WHERE file_id = $1 AND hide_file = false`;

async function GetJobFile(id) {
  const { rows } = await pool.query(GetJobFile_SQL, [id]);
  return rows[0] || null;
}
const GetJobsUnderFile_SQL = `
      SELECT jj.job_index , jj.job_code , jj.job_name
      FROM job_jobs jj
      JOIN job_files jf
        ON jf.file_id = jj.jobfile_id
      WHERE jj.jobfile_id = $1
        AND jf.hide_file = false
        AND jj.hide_job = false
        AND jj.job_index <= jf.jobs_count
      ORDER BY job_index ASC
      `;

async function GetJobsUnderFile(id) {
  const { rows } = await pool.query(GetJobsUnderFile_SQL, [id]);
  return rows || null;
}

router.get("/file/:fileid", requiredLogged, async (req, res) => {
  try {
    const { fileid } = req.params;

    const getCus = await pool.query(
      `SELECT 
      *
      FROM customers
      WHERE id !=1
      ORDER BY customer_name ASC`,
    );
    const customers = getCus.rows;

    if (fileid === "new") {
      return res.json({ customers });
    }

    const thisJobFile = await GetJobFile(fileid);
    const theseJobs = await GetJobsUnderFile(fileid);

    return res.json({ customers, thisJobFile, theseJobs });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/file/form1", requiredLogged, async (req, res) => {
  try {
    const {
      fileid,
      customer_id,
      file_name,
      doc_name,
      bid_deadline_i,
      jobs_count,
      bidbond,
      unreg_customer,
    } = req.body;

    const user_id = getUserID(req);
    const safeJobsCount = Number(jobs_count) || 1;
    const bb_status = Number(bidbond?.status) || 0;

    const beforeUpdate = await GetJobFile(fileid);
    const bbStsBefore = Number(beforeUpdate?.bidbond?.status) || 0;

    if (fileid) {
      if (!requiredLevel(req, res, "level_jobs", 3)) return;

      /////////////////////////////////

      if (bbStsBefore > 1 && bb_status <= 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid  bidbond status`,
        });
      }

      ////////////////////////////////////

      const {
        rows: [afterUpdate],
      } = await pool.query(
        `
        UPDATE job_files SET 
          customer_id = $1,
          unreg_customer = $8,
          file_name   = $2, 
          doc_name    = $3, 
          bid_deadline = $4,
          jobs_count  = $5,
          bidbond =  jsonb_set(COALESCE(bidbond, '{}'::jsonb), '{status}', to_jsonb($6::int), true)
        WHERE file_id = $7 AND $5 >= jobs_count   
        RETURNING *
        `,
        [
          customer_id,
          file_name,
          doc_name,
          bid_deadline_i,
          safeJobsCount,
          bb_status,
          fileid,
          unreg_customer,
        ],
      );

      const { old_v, new_v } = WhatzChanged(beforeUpdate, afterUpdate);

      await RecActivity(
        user_id,
        "update",
        old_v,
        new_v,
        "/jobs/file/form1",
        fileid,
        null,
        "jbfilef1",
        null,
        "job_files",
      );

      const thisJobFile = await GetJobFile(fileid);
      res.status(200).json({ success: true, thisJobFile });
    } else {
      if (!requiredLevel(req, res, "level_jobs", 1)) return;
      const {
        rows: [afterInsert],
      } = await pool.query(
        `INSERT INTO job_files 
        (
          customer_id,
          file_name,
          doc_name, 
          bid_deadline,
          jobs_count,
          bidbond,
          created_user,
          unreg_customer
        ) 
        VALUES (
          $1, $2, $3, $4, $5,
          jsonb_set('{}'::jsonb,'{status}', to_jsonb($6::int), true), 
          $7, $8
        )
        RETURNING file_id`,
        [
          customer_id,
          file_name,
          doc_name,
          bid_deadline_i,
          safeJobsCount,
          bb_status,
          user_id,
          unreg_customer,
        ],
      );
      const load_this_id = afterInsert.file_id;
      await RecActivity(
        user_id,
        "insert",
        "{}",
        "{}",
        "/jobs/file/form1",
        load_this_id,
        null,
        "jbfilef1",
        null,
        "job_files",
      );

      res.status(200).json({ success: true, load_this_id });
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/file/form2", requiredLogged, async (req, res) => {
  try {
    const { method, when, to, by, reason, fileid } = req.body;

    const safeBidSubMeth = Number(method) || 0;
    const user_id = getUserID(req);
    console.log("form2");
    console.log("user ", user_id);
    console.log("reqbody ", req.body);

    if (!requiredLevel(req, res, "level_jobs", 1)) return;

    const { rows: rowsBefore } = await pool.query(
      "SELECT bid_submit FROM job_files WHERE file_id = $1",
      [fileid],
    );

    const beforeUpdate = rowsBefore[0];

    const bidSubMethBefore = Number(beforeUpdate?.bid_submit?.method) || 0;

    if (bidSubMethBefore !== 0 && bidSubMethBefore !== safeBidSubMeth) {
      return res.status(400).json({
        success: false,
        message: `cannot change submit method`,
      });
    }

    const { rows: rowsAfter, rowCount: rowCountAfter } = await pool.query(
      ` UPDATE job_files
        SET bid_submit =
          COALESCE(bid_submit, '{}'::jsonb) ||
          jsonb_build_object(
            'method', $1::int,
            'when',   $2::text,
            'to',     $3::text,
            'by',     $4::text,
            'reason', $5::text
          )
        WHERE file_id = $6
        RETURNING bid_submit`,
      [safeBidSubMeth, when, to, by, reason, fileid],
    );

    // CHANGED: rows is an array, take first row as afterUpdate

    const afterUpdate = rowsAfter[0];
    if (rowCountAfter > 0) {
      const { old_v, new_v } = WhatzChanged(beforeUpdate, afterUpdate);
      await RecActivity(
        user_id,
        "update",
        old_v,
        new_v,
        "/jobs/file/form2",
        fileid,
        null,
        "jbfilef2",
        null,
        "job_files",
      );
    }

    const thisJobFile = await GetJobFile(fileid);
    console.log("thisjobfile - ", thisJobFile);
    res.status(200).json({ success: true, thisJobFile });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

const GetJobJob_SQL = `
      SELECT
          jj.*,
          jf.*,
          cs.cus_name_short,
          cs.customer_name
      FROM job_files AS jf
      LEFT JOIN job_jobs AS jj
            ON jj.jobfile_id = jf.file_id
            AND jj.job_index  = $2
            AND jj.hide_job   = FALSE
      JOIN customers AS cs
          ON cs.id = jf.customer_id
      WHERE jf.file_id   = $1
        AND jf.hide_file = FALSE
        AND $2 <= jf.jobs_count `;

async function GetJobJob(fileid, jobindex) {
  const { rows } = await pool.query(GetJobJob_SQL, [fileid, jobindex]);
  return rows[0] || null;
}

router.get("/job/:fileid/:jobindex", requiredLogged, async (req, res) => {
  try {
    const { fileid, jobindex } = req.params;

    const thisJob = await GetJobJob(fileid, jobindex);
    const theseJobs = await GetJobsUnderFile(fileid);

    return res.json({ thisJob, theseJobs });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post("/job/form1", requiredLogged, async (req, res) => {
  try {
    const { job_code, job_name, jobindex, fileid } = req.body;

    const user_id = getUserID(req);
    // console.log("form1");
    // console.log("user ", user_id);
    // console.log("reqbody ", req.body);

    if (!requiredLevel(req, res, "level_jobs", 1)) return;

    const beforeRes = await pool.query(
      "SELECT job_code, job_name FROM job_jobs WHERE jobfile_id = $1 AND job_index = $2",
      [fileid, jobindex],
    );

    const beforeUpdate = beforeRes.rows[0] || {};
    const exists = beforeRes.rowCount > 0;

    if (exists) {
      if (!requiredLevel(req, res, "level_jobs", 1)) return;
    }

    const sql = exists
      ? `
        UPDATE job_jobs
        SET job_code = $1, job_name = $2
        WHERE jobfile_id = $3 AND job_index = $4
        RETURNING job_code, job_name
      `
      : `
        INSERT INTO job_jobs (jobfile_id, job_index, job_code, job_name)
        VALUES ($3, $4, $1, $2)
        RETURNING job_code, job_name
      `;

    const { rows: rowsAfter, rowCount: rowCountAfter } = await pool.query(sql, [
      job_code,
      job_name,
      fileid,
      jobindex,
    ]);

    const afterUpdate = rowsAfter[0];

    if (rowCountAfter > 0) {
      const { old_v, new_v } = WhatzChanged(beforeUpdate, afterUpdate);
      await RecActivity(
        user_id,
        exists ? "update" : "insert",
        old_v,
        new_v,
        "/jobs/job/form1",
        fileid,
        jobindex,
        "jbjobsf1",
        null,
        "job_jobs",
      );
    }

    const thisJob = await GetJobJob(fileid, jobindex);
    res.status(200).json({ success: true, thisJob });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post("/job/form2", requiredLogged, async (req, res) => {
  try {
    const {
      job_status,
      jobindex,
      fileid,
      tabV,
      sample,
      po,
      delivery,
      job_payment,
      perfbond,
      proof,
      artwork,
      job_info,
      bid_result,
    } = req.body;

    // console.log("form2");
    // console.log("user ", user_id);
    console.log("reqbody ", req.body);
    // minimum for ANY change (insert needs 1+)

    const user_id = getUserID(req);

    if (!requiredLevel(req, res, "level_jobs", 1)) return;
    const tab = Number(tabV) || 0;

    const beforeUpdate = await GetJobJob(fileid, jobindex);
    const jobStatusBefore = Number(beforeUpdate?.job_status) || 0;
    const jobStatusNow = Number(job_status) || 0;

    // stop if status is not increasing
    if (jobStatusNow < jobStatusBefore) {
      return res.status(400).json({
        success: false,
        message: `Invalid job_status`,
      });
    }

    const bidSubMethod = Number(beforeUpdate?.bid_submit?.method) || 0;

    if (tab === 0) {
      await pool.query(
        `
        UPDATE job_jobs
        SET sample = $1
        WHERE jobfile_id = $2
          AND job_index  = $3
        `,
        [sample, fileid, jobindex],
      );
    } else if (![1, 2, 3, 4].includes(bidSubMethod)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid job_status" });
    }
    if (tab === 1 && jobStatusNow) {
      const poStatusBefore = Number(beforeUpdate?.po?.status) || 0;
      const poStatusNow = Number(po?.status) || 0;

      if (poStatusBefore === 2 && poStatusNow !== 2) {
        return res.status(400).json({
          success: false,
          message: `Invalid  po status`,
        });
      }

      await pool.query(
        `
        UPDATE job_jobs
        SET 
        job_status = $1,
        delivery = jsonb_set(jsonb_set(COALESCE(delivery, '{}'::jsonb),'{deadline_type}',to_jsonb($2::int),true),'{deadline}',to_jsonb($3::text),true),
        po =jsonb_set( COALESCE(po, '{}'::jsonb),'{status}',to_jsonb($4::int),true),
        bid_result = $5
        WHERE jobfile_id = $6
          AND job_index  = $7
        `,
        [
          jobStatusNow,
          delivery?.deadline_type ?? 0,
          delivery?.deadline ?? "",
          poStatusNow,
          bid_result,
          fileid,
          jobindex,
        ],
      );
    }
    if (tab === 2 && jobStatusNow) {
      const pbStatusBefore = Number(beforeUpdate?.perfbond?.status) || 0;
      const pbStatusNow = Number(perfbond?.status) || 0;

      if (pbStatusBefore > 1 && pbStatusNow <= 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid  performance bond status`,
        });
      }
      if (
        jobStatusNow >= 2 &&
        (!artwork?.status || !proof?.status || !job_info?.start_at)
      ) {
        return res.status(400).json({
          success: false,
          message: `missing info`,
        });
      }

      await pool.query(
        `
        UPDATE job_jobs
        SET 
        perfbond  = jsonb_set(COALESCE(perfbond, '{}'::jsonb),'{status}',to_jsonb($1::int),true),
        proof = $2,
        artwork = $3,
        job_status = $4,
        job_info = jsonb_set(COALESCE(job_info, '{}'::jsonb),'{start_at}',to_jsonb($5::text),true)
        WHERE jobfile_id = $6
          AND job_index  = $7
        `,
        [
          pbStatusNow,
          proof,
          artwork,
          jobStatusNow,
          job_info.start_at,
          fileid,
          jobindex,
        ],
      );
    }
    if (tab === 3 && jobStatusNow > 1) {
      if (jobStatusNow >= 3 && !job_info?.finish_at) {
        return res.status(400).json({
          success: false,
          message: `missing info`,
        });
      }

      await pool.query(
        `
        UPDATE job_jobs
        SET 
        job_status = $1,
        job_info = jsonb_set(COALESCE(job_info, '{}'::jsonb),'{finish_at}',to_jsonb($2::text),true)
        WHERE jobfile_id = $3
          AND job_index  = $4
   
        `,
        [jobStatusNow, job_info.finish_at, fileid, jobindex],
      );
    }

    if (tab === 4 && jobStatusNow > 1) {
      await pool.query(
        `
        UPDATE job_jobs
        SET 
        job_status = $1,
        delivery = jsonb_set(COALESCE(delivery, '{}'::jsonb),'{log}',COALESCE($2::jsonb, 'null'::jsonb),true)
        WHERE jobfile_id = $3
          AND job_index  = $4
        `,
        [jobStatusNow, delivery?.log ?? null, fileid, jobindex],
      );
    }

    if (tab === 5 && jobStatusNow >= 3) {
      await pool.query(
        `
        UPDATE job_jobs
        SET 
        job_payment = $1
        WHERE jobfile_id = $2
          AND job_index  = $3
        `,
        [job_payment, fileid, jobindex],
      );
    }

    const afterUpdate = await GetJobJob(fileid, jobindex);

    const { old_v, new_v } = WhatzChanged(beforeUpdate, afterUpdate);
    await RecActivity(
      user_id,
      "update",
      old_v,
      new_v,
      "/jobs/job/form2",
      fileid,
      jobindex,
      "jbjobsf2",
      "tabv_" + tab,
      "job_jobs",
    );

    res.status(200).json({
      success: true,
      thisJob: afterUpdate,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
    console.error("Error stack:", err.stack); // ✅ CHANGE: shows exact PG error location
  }
});

router.post("/job/estiDeploy", requiredLogged, async (req, res) => {
  try {
    const { jobindex, fileid } = req.body;

    const user_id = getUserID(req);

    if (!requiredLevel(req, res, "level_jobs", 3)) return;

    const beforeRes = await pool.query(
      "SELECT job_info FROM job_jobs WHERE jobfile_id = $1 AND job_index = $2",
      [fileid, jobindex],
    );

    const beforeUpdate = beforeRes.rows[0] || {};

    const sql = `
        UPDATE job_jobs
        SET job_info = jsonb_set(
          COALESCE(job_info, '{}'::jsonb),
          '{esti_ok}',
          'true'::jsonb,
          true
        )
        WHERE jobfile_id = $1
          AND job_index = $2
        RETURNING job_info
        `;

    const { rows: rowsAfter, rowCount: rowCountAfter } = await pool.query(sql, [
      fileid,
      jobindex,
    ]);

    const afterUpdate = rowsAfter[0];

    if (rowCountAfter > 0) {
      const { old_v, new_v } = WhatzChanged(beforeUpdate, afterUpdate);
      await RecActivity(
        user_id,
        "update",
        old_v,
        new_v,
        "/jobs/job/estiDeploy",
        fileid,
        jobindex,
        "estiDeploy",
        null,
        "job_jobs",
      );
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
