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

const date6Con = (h) => {
  return ` TO_CHAR(${h}, 'YYMMDD') AS ${h}_x`;
};
const dateTimeCon = (h) => {
  return ` TO_CHAR(${h}, 'YYYY-MM-DD @ HH24:MI') AS ${h}_t`;
};
const dateInpCon = (h) => {
  return `TO_CHAR(${h}, 'YYYY-MM-DD"T"HH24:MI') AS ${h}_i`;
};
const dateCon = (h) => {
  return `TO_CHAR(${h}, 'YYYY-MM-DD') AS ${h}_`;
};

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
      `SELECT
      ${dateCon("date")} ,
      price 
      FROM paper_price 
      WHERE paper_id = $1 ORDER BY date DESC`,
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
      `SELECT *,
      ${dateCon("date")}
      FROM paper_stock WHERE stock_id = $1 ORDER BY date`,
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
      ${dateCon("reg_till")}
      FROM customers
      ORDER BY customer_name ASC`
    )
    .then((result) => {
      return result.rows;
    });
}

async function GetBanks() {
  const result = await pool.query(
    `SELECT id,customer_name FROM customers 
      WHERE is_bank
      ORDER BY customer_name ASC`
  );
  return result.rows;
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

const JobsById_SQL = `
      SELECT
      *,
      ${dateInpCon("deadline")},
      ${date6Con("created_at")},
      ${dateTimeCon("created_at")},
      ${dateCon("submit_at")}
      FROM jobs
      WHERE id = $1 AND private = false`;

async function JobsById(id) {
  const { rows } = await pool.query(JobsById_SQL, [id]);
  return rows[0] || null;
}

const JobsEByIdM_SQL = `
      SELECT 
      je.*,
      ${dateCon("deadline_dl")},
      ${dateCon("j_start_at")},
      ${dateCon("j_end_at")}
      FROM jobs_each je
      JOIN jobs j ON je.id_main = j.id
      WHERE je.id_main = $1 AND j.private = false
      ORDER BY je.id_each ASC`;

async function JobsEByIdM(id_main) {
  const { rows } = await pool.query(JobsEByIdM_SQL, [id_main]);
  return rows.map((row) => ({
    ...row,
    profit: Number(row.profit) || 0,
  }));
}

const JobsXByIdM_SQL = `
      SELECT 
      jx.*,
      ${dateCon("po_date")}
      FROM jobs_eachx jx
      JOIN jobs j ON jx.id_main = j.id
      WHERE jx.id_main = $1 AND j.private = false
      ORDER BY jx.id_each ASC`;

async function JobsXByIdM(id_main) {
  const { rows } = await pool.query(JobsXByIdM_SQL, [id_main]);
  return rows || null;
}

const JobsEByIdE_SQL = `
  SELECT je.*,
  ${dateCon("deadline_dl")},
  ${dateCon("j_start_at")},
  ${dateCon("j_end_at")}
  FROM jobs_each je
  JOIN jobs j ON je.id_main = j.id
  WHERE je.id_main = $1
    AND je.id_each = $2
    AND j.private = false
  LIMIT 1
`;

async function JobsEByIdE(id_main, id_each) {
  const { rows } = await pool.query(JobsEByIdE_SQL, [id_main, id_each]);
  const row = rows[0] || null;
  if (row) {
    row.profit = Number(row.profit) || 0;
  }
  return row;
}

const JobsXByIdE_SQL = `
      SELECT 
      jx.*,
      ${dateCon("po_date")}
      FROM jobs_eachx jx
      JOIN jobs j ON jx.id_main = j.id
      WHERE jx.id_main = $1 AND j.private = false AND id_each=$2
      ORDER BY jx.id_each ASC`;

async function JobsXByIdE(id_main, id_each) {
  const { rows } = await pool.query(JobsXByIdE_SQL, [id_main, id_each]);
  return rows[0] || null;
}

///////////////////////////////////////////////////

app.get("/jobs", async (req, res) => {
  try {
    const { rows: jobs } = await pool.query(
      `SELECT
      j.*,
      ${dateTimeCon("deadline")},
      ${date6Con("created_at")},
      (SELECT COUNT(*)::int FROM jobs_each je WHERE je.id_main = j.id AND je.deployed AND je.id_each <= j.total_jobs) AS dep_count,
      (SELECT COUNT(*)::int FROM jobs_eachx jx WHERE jx.id_main = j.id AND jx.pb > 0 AND jx.id_each <= j.total_jobs) AS pb_done_count,
      (SELECT COUNT(*)::int FROM jobs_eachx jx WHERE jx.id_main = j.id AND jx.bb > 0 AND jx.id_each <= j.total_jobs) AS bb_done_count,
      (SELECT COUNT(*)::int FROM jobs_eachx jx WHERE jx.id_main = j.id AND jx.samp_pp > 0 AND jx.id_each <= j.total_jobs) AS spp_ready_count,
      (SELECT COUNT(*)::int FROM jobs_eachx jx WHERE jx.id_main = j.id AND jx.samp_pp > 1 AND jx.id_each <= j.total_jobs) AS spp_approved_count,
      (SELECT COUNT(*)::int FROM jobs_eachx jx WHERE jx.id_main = j.id AND jx.res_status > 0 AND jx.id_each <= j.total_jobs) AS res_count,
      (SELECT COUNT(*)::int FROM jobs_eachx jx WHERE jx.id_main = j.id AND jx.res_status = 2 AND jx.id_each <= j.total_jobs) AS inc_respub,
      COALESCE(NULLIF(c.cus_name_short, ''), c.customer_name) AS customer_name FROM jobs j
      LEFT JOIN customers c ON c.id = j.customer
      WHERE j.private = false
      ORDER BY j.deadline ASC`
    );
    const { rows: qualified } = await pool.query(
      `SELECT je.*, j.*, c.*, jx.*,
        ${date6Con("j_created_at")},
        ${dateCon("deadline_dl")}
        FROM jobs_each je
        JOIN (SELECT j.*, j.created_at AS j_created_at FROM jobs j) j ON j.id = je.id_main
        JOIN jobs_eachx jx ON jx.id_main = je.id_main and jx.id_each=je.id_each
        JOIN customers c ON c.id = j.customer
        WHERE j.private = false
        AND je.j_status > 0
        ORDER BY j.deadline ASC`
    );
    console.log(qualified);
    res.json({ jobs, qualified });
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
    //main
    const mainJobData = await JobsById(id);

    //saved each
    const savedEachJob = await JobsEByIdM(id);

    //saved eachxtra
    const savedEachXJ = await JobsXByIdM(id);

    //qts componants
    const getQtsComp = await pool.query(
      `SELECT * FROM jobs_qts ORDER BY id ASC `
    );
    const qtsComps = getQtsComp.rows;

    const getActivity = await pool.query(
      `SELECT 
      user_act.*, 
      u.display_name,
      ${dateTimeCon("act_at")} 
      FROM user_act 
      LEFT JOIN users u ON user_act.act_user =  u.id
      WHERE note1 = '${id}' ORDER BY act_at DESC`
    );
    const activity_ = getActivity.rows;

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
    const qtsDefJsons = { loop_count, v, notes_other };

    //all paper data
    const allPapers = await GetPapersFullData();
    const getAct = await GetJobsAct(id);

    ////////
    res.json({
      cus,
      mainJobData,
      savedEachJob,
      savedEachXJ,
      qtsDefJsons,
      qtsComps,
      allPapers,
      getAct,
      activity_,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("Error");
  }
});

app.post("/jobs/div1", requireAuth, async (req, res) => {
  try {
    const {
      id,
      customer,
      reference,
      deadline_i,
      total_jobs,
      contact_p,
      contact_d,
    } = req.body;

    let load_this_id;
    const user_id = getUser(req);

    if (id) {
      const {
        rows: [beforeU],
      } = await pool.query("SELECT * FROM jobs WHERE id = $1", [id]);

      const {
        rows: [afterU],
      } = await pool.query(
        `UPDATE jobs SET 
        customer = $1,
        reference=$2, 
        deadline = $3,
        total_jobs=$4,
        contact_p=$5,
        contact_d=$6 
        WHERE id = $7 RETURNING *`,
        [customer, reference, deadline_i, total_jobs, contact_p, contact_d, id]
      );
      load_this_id = id;

      const { old_v, new_v, add_v, del_v, chan_v } = WhatHappend(
        beforeU,
        afterU
      );

      await RecActivity(
        user_id,
        "up",
        old_v,
        new_v,
        chan_v,
        add_v,
        del_v,
        "/jobs/div1",
        id,
        null,
        "jbd1",
        null,
        "jobs"
      );
    } else {
      const result = await pool.query(
        `INSERT INTO jobs (
        customer,
        reference, 
        deadline,
        total_jobs,
        contact_p,
        contact_d,
        created_by
        ) VALUES ($1, $2,$3,$4,$5,$6,$7) RETURNING id`,
        [
          customer,
          reference,
          deadline_i,
          total_jobs || 1,
          contact_p,
          contact_d,
          user_id,
        ]
      );
      const new_v = req.body;
      load_this_id = result.rows[0].id;
      await RecActivity(
        user_id,
        "in",
        {},
        new_v,
        [],
        [],
        [],
        "/jobs/div1",
        load_this_id,
        null,
        "jbd1",
        null,
        "jobs"
      );
    }
    res.status(200).json({ success: true, load_this_id });
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).send("Error saving job");
  }
});

app.post("/jobs/div2", requireAuth, async (req, res) => {
  const {
    id_main,
    id_each,
    item_count,
    unit_count,
    loop_count,
    v,
    notes_other,
    profit,
    deployed,
    cus_id_each,
  } = req.body;

  const user_id = getUser(req);

  try {
    const params = [
      item_count,
      unit_count,
      loop_count,
      v,
      notes_other,
      profit,
      deployed,
      cus_id_each,
      id_main,
      id_each,
    ];

    const beforeU = (await JobsEByIdE(id_main, id_each)) || null;
    const {
      v: v1,
      notes_other: no1,
      loop_count: lc1,
      ...beforeMini
    } = beforeU ?? {};

    const updSQL = `
      UPDATE jobs_each
      SET item_count=$1, unit_count=$2, loop_count=$3, v=$4,
      notes_other=$5, profit=$6, deployed=$7, cus_id_each=$8
      WHERE id_main=$9 AND id_each=$10
      RETURNING *;
    `;

    const upd = await pool.query(updSQL, params);

    if (upd.rowCount === 0) {
      const insSQL = `
        INSERT INTO jobs_each (
          id_main, id_each, item_count, unit_count, loop_count, v,
          notes_other, profit,  deployed, cus_id_each
        )
        VALUES ($9, $10, $1, $2, $3, $4, $5, $6, $7, $8);
      `;
      await pool.query(insSQL, params);
    }

    //////////////////////////////

    const afterU = await JobsEByIdE(id_main, id_each);

    const { v: v2, notes_other: no2, loop_count: lc2, ...afterMini } = afterU;

    const { old_v, new_v, add_v, del_v, chan_v } = WhatHappend(
      beforeMini || {},
      afterMini
    );

    const action = upd.rowCount === 0 ? "in" : "up";
    const note3_ = deployed && !beforeU?.deployed ? "deploy" : "jbd2";

    await RecActivity(
      user_id,
      action,
      old_v,
      new_v,
      chan_v,
      add_v,
      del_v,
      "/jobs/div2",
      id_main,
      id_each,
      note3_,
      null,
      "jobs_each"
    );
    res.status(200).json(afterU);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).send("Error saving job");
  }
});

app.post("/jobs/div3", requireAuth, async (req, res) => {
  const { id_each, id_main, form } = req.body;
  //console.log(req.body);
  const user_id = getUser(req);

  try {
    const beforeU =
      form === "est_sub" ? {} : await JobsXByIdE(id_main, id_each);
    if (form === "est_sub") {
      const { submit_method, submit_note1, submit_note2, submit_at_ } =
        req.body;
      await pool.query(
        `
        UPDATE jobs SET
        submit_method = $1,
        submit_note1 = $2,
        submit_note2 = $3,
        submit_at= $4
        WHERE id = $5 AND private=false`,
        [
          submit_method,
          submit_note1.trim(),
          submit_note2.trim(),
          submit_at_,
          id_main,
        ]
      );
    } else if (form === "bb") {
      //need both inser and update
      const updt = `
          UPDATE jobs_eachx
          SET bb=$3, bb_amount=$4 WHERE id_main=$1 AND id_each=$2`;

      const insrt = `
          INSERT INTO jobs_eachx 
          (id_main, id_each, bb, bb_amount)
          SELECT $1, $2, $3, $4`;

      const { bb, bb_amount } = req.body;
      const params = [id_main, id_each, bb, bb_amount];

      const upd = await pool.query(updt, params);

      if (upd.rowCount === 0) {
        await pool.query(insrt, params);
      }
    } else if (form === "samp_pp") {
      //need both inser and update
      const updt = `
          UPDATE jobs_eachx
          SET samp_pp=$3 WHERE id_main=$1 AND id_each=$2`;

      const insrt = `
          INSERT INTO jobs_eachx 
          (id_main, id_each, samp_pp)
          SELECT $1, $2, $3,`;

      const { samp_pp } = req.body;
      const params = [id_main, id_each, samp_pp];
      const upd = await pool.query(updt, params);

      if (upd.rowCount === 0) {
        await pool.query(insrt, params);
      }
    } else if (form === "result") {
      //need both inser and update
      const updt = `
          UPDATE jobs_eachx
          SET result=$3, res_status=$4 WHERE id_main=$1 AND id_each=$2`;

      const insrt = `
          INSERT INTO jobs_eachx 
          (id_main, id_each, result, res_status)
          SELECT $1, $2, $3, $4`;

      const { result, res_status } = req.body;
      const params = [id_main, id_each, result, res_status];
      const upd = await pool.query(updt, params);

      if (upd.rowCount === 0) {
        await pool.query(insrt, params);
      }
    }
    /////////////////////

    const afterU =
      form === "est_sub"
        ? await JobsById(id_main)
        : await JobsXByIdE(id_main, id_each);

    const { old_v, new_v, add_v, del_v, chan_v } = WhatHappend(
      beforeU || {},
      afterU
    );

    const action = !beforeU ? "in" : "up";
    const table_ = form === "est_sub" ? "jobs" : "jobs_eachx";

    await RecActivity(
      user_id,
      action,
      old_v,
      new_v,
      chan_v,
      add_v,
      del_v,
      "/jobs/div3",
      id_main,
      id_each || null,
      form,
      null,
      table_
    );

    res.status(200).json(afterU);
    ////////////////////////
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).send("Error saving job");
  }
});
///////////////////////////////////////

app.post("/jobs/div4", requireAuth, async (req, res) => {
  const { id_main, form, id_each } = req.body;

  const user_id = getUser(req);
  try {
    const ejx_ =
      form === "pb" || form === "po" || form === "full_payment" ? true : false;
    const beforeU = ejx_
      ? await JobsXByIdE(id_main, id_each)
      : await JobsEByIdE(id_main, id_each);

    if (form === "j_status") {
      //need both inser and update
      const updt = `
          UPDATE jobs_each
          SET j_status=$3, deadline_dl=$4, deadline_dlty=$5 WHERE id_main=$1 AND id_each=$2`;

      const insrt = `
          INSERT INTO jobs_each 
          (id_main, id_each, j_status, deadline_dl, deadline_dlty)
          SELECT $1, $2, $3, $4, $5`;

      const { j_status, deadline_dl_, deadline_dlty } = req.body;
      const params = [id_main, id_each, j_status, deadline_dl_, deadline_dlty];

      const upd = await pool.query(updt, params);

      if (upd.rowCount === 0) {
        await pool.query(insrt, params);
      }
    } else if (form === "pb") {
      //need both inser and update
      const updt = `
          UPDATE jobs_eachx
          SET pb=$3, pb_amount=$4 WHERE id_main=$1 AND id_each=$2`;

      const insrt = `
          INSERT INTO jobs_eachx 
          (id_main, id_each, pb, pb_amount)
          SELECT $1, $2, $3, $4`;

      const { pb, pb_amount } = req.body;
      const params = [id_main, id_each, pb, pb_amount];

      const upd = await pool.query(updt, params);

      if (upd.rowCount === 0) {
        await pool.query(insrt, params);
      }
    } else if (form === "po") {
      //need both inser and update
      const updt = `
          UPDATE jobs_eachx
          SET po=$3, po_date=$4 WHERE id_main=$1 AND id_each=$2`;

      const insrt = `
          INSERT INTO jobs_eachx 
          (id_main, id_each, po, po_date)
          SELECT $1, $2, $3, $4`;

      const { po, po_date_ } = req.body;
      const params = [id_main, id_each, po, po_date_];

      const upd = await pool.query(updt, params);

      if (upd.rowCount === 0) {
        await pool.query(insrt, params);
      }
    } else if (form === "samp_pr") {
      //need both inser and update
      const updt = `
          UPDATE jobs_each
          SET samp_pr=$3  WHERE id_main=$1 AND id_each=$2`;

      const insrt = `
          INSERT INTO jobs_each
          (id_main, id_each, samp_pr)
          SELECT $1, $2, $3`;

      const { samp_pr } = req.body;
      const params = [id_main, id_each, samp_pr];

      const upd = await pool.query(updt, params);

      if (upd.rowCount === 0) {
        await pool.query(insrt, params);
      }
    } else if (form === "aw") {
      //need both inser and update
      const updt = `
          UPDATE jobs_each
          SET aw=$3 WHERE id_main=$1 AND id_each=$2`;

      const insrt = `
          INSERT INTO jobs_each
          (id_main, id_each, aw)
          SELECT $1, $2, $3`;

      const { aw } = req.body;
      const params = [id_main, id_each, aw];

      const upd = await pool.query(updt, params);

      if (upd.rowCount === 0) {
        await pool.query(insrt, params);
      }
    } else if (form === "j_statusmain") {
      //need both inser and update
      const updt = `
          UPDATE jobs_each
          SET j_status=$3, j_start_at =$4, j_end_at =$5 WHERE id_main=$1 AND id_each=$2`;

      const insrt = `
          INSERT INTO jobs_each 
          (id_main, id_each, j_status, j_start_at, j_end_at)
          SELECT $1, $2, $3, $4, $5`;

      const { j_status, j_start_at_, j_end_at_ } = req.body;
      const params = [id_main, id_each, j_status, j_start_at_, j_end_at_];

      const upd = await pool.query(updt, params);

      if (upd.rowCount === 0) {
        await pool.query(insrt, params);
      }
    } else if (form === "delivery") {
      //need both inser and update
      const updt = `
          UPDATE jobs_each
          SET deli_times=$3, delivery=$4 WHERE id_main=$1 AND id_each=$2`;

      const insrt = `
          INSERT INTO jobs_each
          (id_main, id_each, deli_times, delivery)
          SELECT $1, $2, $3, $4`;

      const { deli_times, delivery } = req.body;
      const params = [id_main, id_each, deli_times, delivery];

      const upd = await pool.query(updt, params);

      if (upd.rowCount === 0) {
        await pool.query(insrt, params);
      }
    } else if (form === "full_payment") {
      //need both inser and update
      const updt = `
          UPDATE jobs_eachx
          SET fp_amount=$3, full_paym=$4 WHERE id_main=$1 AND id_each=$2`;

      const insrt = `
          INSERT INTO jobs_eachx 
          (id_main, id_each, fp_amount, full_paym)
          SELECT $1, $2, $3, $4`;

      const { fp_amount, full_paym } = req.body;
      const params = [id_main, id_each, fp_amount, full_paym];

      const upd = await pool.query(updt, params);

      if (upd.rowCount === 0) {
        await pool.query(insrt, params);
      }
    }

    const afterU = ejx_
      ? await JobsXByIdE(id_main, id_each)
      : await JobsEByIdE(id_main, id_each);

    const { old_v, new_v, add_v, del_v, chan_v } = WhatHappend(
      beforeU || {},
      afterU
    );
    const action = !beforeU ? "in" : "up";
    const table_ = ejx_ ? "jobs_eachx" : "jobs_each";

    await RecActivity(
      user_id,
      action,
      old_v,
      new_v,
      chan_v,
      add_v,
      del_v,
      "/jobs/div4",
      id_main,
      id_each || null,
      form,
      null,
      table_
    );

    res.status(200).json(afterU);

    ////////////////////////
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).send("Error saving job");
  }
});
//activity     /////////////////////////////////////

async function RecActivity(
  user_id,
  action,
  old_v,
  new_v,
  chan_v,
  add_v,
  del_v,
  root,
  note1,
  note2,
  note3,
  note4,
  table
) {
  const RECACT_SQL = `
          INSERT INTO user_act 
          (act_user, action, old_v, new_v, chan_v, add_v, del_v, root, note1, note2, note3,note4, table_)
          SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13`;

  await pool.query(RECACT_SQL, [
    user_id,
    action,
    old_v,
    new_v,
    chan_v,
    add_v,
    del_v,
    root,
    note1,
    note2,
    note3,
    note4,
    table,
  ]);
}

function WhatHappend(oldRow = {}, newRow = {}) {
  const keys = new Set([...Object.keys(oldRow), ...Object.keys(newRow)]);
  const old_v = {};
  const new_v = {};
  const add_v = [];
  const del_v = [];
  const chan_v = [];

  for (const k of keys) {
    const oldHas = Object.prototype.hasOwnProperty.call(oldRow, k);
    const newHas = Object.prototype.hasOwnProperty.call(newRow, k);
    const oldVal = oldRow[k];
    const newVal = newRow[k];

    if (newHas && !oldHas) add_v.push(k);
    if (oldHas && !newHas) del_v.push(k);

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      if (oldHas) old_v[k] = oldVal;
      if (newHas) new_v[k] = newVal;
      chan_v.push(k);
    }
  }

  return {
    old_v: JSON.stringify(old_v),
    new_v: JSON.stringify(new_v),
    add_v: JSON.stringify(add_v),
    del_v: JSON.stringify(del_v),
    chan_v: JSON.stringify(chan_v),
  };
}
const GETJOBSACT__SQL = `
     SELECT 
      s.id_main, 
      s.id_each,
      TO_CHAR(MAX(u.act_at) FILTER (WHERE u.note3='j_status'),'YYYY-MM-DD @ HH24:MI') AS j_status_at,
      MAX(u.display_name) FILTER (WHERE u.note3='j_status') AS j_status_by,   -- CHANGED
      TO_CHAR(MAX(u.act_at) FILTER (WHERE u.note3='bb'),'YYYY-MM-DD @ HH24:MI') AS bb_at,
      MAX(u.display_name) FILTER (WHERE u.note3='bb') AS bb_by,               -- CHANGED
      TO_CHAR(MAX(u.act_at) FILTER (WHERE u.note3='pb'),'YYYY-MM-DD @ HH24:MI') AS pb_at,
      MAX(u.display_name) FILTER (WHERE u.note3='pb') AS pb_by,               -- CHANGED
      TO_CHAR(MAX(u.act_at) FILTER (WHERE u.note3='po'),'YYYY-MM-DD @ HH24:MI') AS po_at,
      MAX(u.display_name) FILTER (WHERE u.note3='po') AS po_by,               -- CHANGED
      TO_CHAR(MAX(u.act_at) FILTER (WHERE u.note3='result'),'YYYY-MM-DD @ HH24:MI') AS result_at,
      MAX(u.display_name) FILTER (WHERE u.note3='result') AS result_by,       -- CHANGED
      TO_CHAR(MAX(u.act_at) FILTER (WHERE u.note3='jbd2'),'YYYY-MM-DD @ HH24:MI') AS jbd2_at,
      MAX(u.display_name) FILTER (WHERE u.note3='jbd2') AS jbd2_by,           -- CHANGED
      TO_CHAR(MAX(u.act_at) FILTER (WHERE u.note3='samp_pp'),'YYYY-MM-DD @ HH24:MI') AS samp_pp_at,
      MAX(u.display_name) FILTER (WHERE u.note3='samp_pp') AS samp_pp_by      -- CHANGED
      FROM (
      SELECT j.id AS id_main, gs AS id_each
      FROM jobs j, generate_series(1, j.total_jobs) gs
      WHERE j.id = $1
      ) s
      LEFT JOIN LATERAL (
        SELECT DISTINCT ON (ua.note3)
              ua.note3, ua.act_at, ua.act_user,
              u.display_name                                  
        FROM user_act ua
        LEFT JOIN users u ON u.id = ua.act_user            
        WHERE ua.note1 = s.id_main::text 
          AND ua.note2 = s.id_each::text
          AND ua.note3 IN ('j_status','bb','pb','po','result','jbd2','samp_pp')
        ORDER BY ua.note3, ua.act_at DESC, ua.id DESC
      ) u ON true
      GROUP BY s.id_main, s.id_each
      ORDER BY s.id_each
      `;

async function GetJobsAct(id) {
  const { rows } = await pool.query(GETJOBSACT__SQL, [id]);
  return rows || null;
}

//AUDIT       //////////////////////////////////////////

const BB_SQL = `
      SELECT 
      jx.*,
      j.*,
      ${date6Con("created_at")},
      ${dateTimeCon("deadline")},
      ${dateCon("bb_op_at")},
      ${dateCon("bb_ref_at")},
      COALESCE(NULLIF(c.cus_name_short, ''), c.customer_name) AS customer_name
      FROM jobs_eachx jx
      JOIN jobs j 
      ON jx.id_main = j.id
      LEFT JOIN customers c 
      ON c.id = j.customer
      WHERE j.private = false
      AND jx.bb !=1`;

const BBPending_SQL = `
      SELECT 
      j.*,
      ${dateTimeCon("deadline")},
      ${date6Con("created_at")},
      COALESCE(NULLIF(c.cus_name_short, ''), c.customer_name) AS customer_name FROM jobs j
      LEFT JOIN customers c ON c.id = j.customer
      WHERE j.private = false AND j.submit_method!=5
      AND 
      (SELECT COUNT(*)::int FROM jobs_eachx jx WHERE jx.id_main = j.id AND jx.bb > 0 AND jx.id_each <= j.total_jobs) < j.total_jobs
      ORDER BY j.deadline ASC`;

//giving saved once only. no problem because bb=2,and bb=3 always saved
async function BBAll() {
  const { rows } = await pool.query(`${BB_SQL} ORDER BY jx.idx ASC`);
  return rows || null;
}
async function BBPending() {
  const { rows } = await pool.query(BBPending_SQL);
  return rows || null;
}
async function BBOne(idx) {
  const { rows } = await pool.query(`${BB_SQL} AND idx=${idx}`);
  return rows[0] || null;
}

app.get("/audit/bb", async (req, res) => {
  try {
    const bb = await BBAll();
    const bbPending = await BBPending();
    const banks = await GetBanks();
    res.json({ bb, banks, bbPending });
  } catch (err) {
    res.status(500).send("Error");
  }
});

app.post("/audit/bb", async (req, res) => {
  console.log(req.body);
  try {
    const { bbtemp, bb, bb_code, bb_op_at_, bb_bank, idx, bb_ref_at_, bb_ref } =
      req.body;

    const updt = `
          UPDATE jobs_eachx
          SET bb=$1, bb_code=$3,bb_op_at=$4,bb_bank=$5,bb_ref_at=$6,bb_ref=$7
          WHERE idx=$8`;

    const p = [
      bbtemp || bb,
      bb_code,
      bb_op_at_,
      bb_bank,
      bb_ref_at_,
      bb_ref,
      idx,
    ];
    await pool.query(updt, p);
    const ret = await BBOne(idx);

    res.status(200).json(ret);
  } catch (err) {
    res.status(500).send("Error");
    console.error("Error fetching papers:", err);
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
    res.status(500).json({ error: "Failed to load" });
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

// EXTRA SECURITY   //////////////////////////////////////////////////////
function requireAuth(req, res, next) {
  if (req.isAuthenticated?.() && req.user) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

function getUser(req) {
  return req.user?.id || null;
}

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
    res.json({
      loggedIn: false,
      level: 0,
      level_jobs: 0,
      level_audit: 0,
      level_paper: 0,
    });
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
