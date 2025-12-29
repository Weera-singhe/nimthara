const pool = require("../Db/pool");

async function RecActivity(
  user_id,
  action,
  old_v,
  new_v,
  root,
  note1,
  note2,
  note3,
  note4,
  table
) {
  await pool.query(
    `
    INSERT INTO user_act
    (act_user, action, old_v, new_v, root, note1, note2, note3, note4, table_)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `,
    [user_id, action, old_v, new_v, root, note1, note2, note3, note4, table]
  );
}

function WhatzChanged(oldRow, newRow = {}) {
  if (!oldRow) return { old_v: {}, new_v: {} };

  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

  const diff = (a, b) => {
    if (a === b) return null;
    if (!isObj(a) || !isObj(b)) return [a, b];

    let o = {},
      n = {};
    for (const k in a) {
      const d = diff(a[k], b[k]);
      if (d) {
        o[k] = d[0];
        n[k] = d[1];
      }
    }
    return Object.keys(o).length ? [o, n] : null;
  };

  const d = diff(oldRow, newRow);
  return { old_v: d?.[0] || {}, new_v: d?.[1] || {} };
}

async function GetPapersFullData() {
  const specs = await pool.query(`
    SELECT id, CONCAT(p_type, ' ', den,p_den_unit,' ', size_h, 'x', size_w,
    ' ', p_brand, ' ', p_color) AS name,
    p_unit AS unit, unit_val,latest_price FROM paper_specs_`);
  return specs.rows;
}

module.exports = { RecActivity, WhatzChanged, GetPapersFullData };
