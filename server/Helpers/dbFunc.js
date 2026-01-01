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
    SELECT * FROM paper_data`);
  return specs.rows;
}
async function GetAllPaperSpecs() {
  const p_brand = await pool.query(`
    SELECT id, COALESCE(p_brand, '') AS brand FROM paper_specs
    WHERE p_brand IS NOT NULL ORDER BY p_brand COLLATE "C"`);
  const p_type = await pool.query(`
    SELECT id, COALESCE(p_type, '') AS type FROM paper_specs
    WHERE p_type IS NOT NULL ORDER BY id`);
  const p_color = await pool.query(`
    SELECT id, COALESCE(p_color, '') AS color FROM paper_specs
    WHERE p_color IS NOT NULL ORDER BY id`);
  const p_unit_type = await pool.query(`
    SELECT id, COALESCE(p_unit_type, '') AS unit_type FROM paper_specs
    WHERE p_unit_type IS NOT NULL ORDER BY id`);
  const p_den_unit = await pool.query(`
    SELECT id, COALESCE(p_den_unit, '') AS denUnit FROM paper_specs
    WHERE p_den_unit IS NOT NULL ORDER BY id`);

  return {
    brands: p_brand.rows,
    types: p_type.rows,
    colors: p_color.rows,
    unit_types: p_unit_type.rows,
    den_units: p_den_unit.rows,
  };
}

module.exports = {
  RecActivity,
  WhatzChanged,
  GetPapersFullData,
  GetAllPaperSpecs,
};
