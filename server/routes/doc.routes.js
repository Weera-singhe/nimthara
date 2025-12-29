const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const pool = require("../Db/pool");
const {
  requiredLogged,
  requiredLevel,
  getUserID,
} = require("../Auth/authcheck");
const { RecActivity } = require("../Helpers/dbFunc");

/* CLOUDINARY */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* MULTER */
const TEMP_DIR = path.join(__dirname, "..", "temp_uploads");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const upload = multer({
  dest: TEMP_DIR,
  limits: { fileSize: 10 * 1024 * 1024 },
});

/* DB */
const GetUploadedDocs_SQL = `SELECT * FROM uploads WHERE located_id = $1`;
async function GetUploadedDocs(located_id) {
  const { rows } = await pool.query(GetUploadedDocs_SQL, [located_id]);
  return rows || [];
}

/* GET */
router.get("/:locatedid", requiredLogged, async (req, res) => {
  try {
    const uploads = await GetUploadedDocs(req.params.locatedid);
    res.json(uploads);
  } catch {
    res.status(500).json({ error: "fetch failed" });
  }
});

/* POST */
router.post(
  "/:locatedid",
  requiredLogged,
  upload.array("files"),
  async (req, res) => {
    const { locatedid } = req.params;
    const user_id = getUserID(req);

    const folderName = req.body.folder_name || "doc";
    const prefix = req.body.prefix ? `${req.body.prefix}_` : "";
    const renamedAs = req.body?.renamedAs?.trim();

    try {
      await Promise.all(
        (req.files || []).map(async (file) => {
          const rawName = renamedAs || file.originalname;
          const baseName = rawName.replace(/\.[^/.]+$/, "");
          const publicId = `${prefix}${baseName}_${Date.now()}`;

          const uploadResult = await cloudinary.uploader.upload(file.path, {
            folder: folderName,
            resource_type: "auto",
            public_id: publicId,
          });

          fs.unlinkSync(file.path);

          await pool.query(
            `INSERT INTO uploads (located_id, filename, url, public_id, format)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              locatedid,
              prefix + baseName,
              uploadResult.secure_url,
              uploadResult.public_id,
              uploadResult.format,
            ]
          );

          await RecActivity(
            user_id,
            "upload",
            {},
            { filename: prefix + baseName },
            "/" + publicId,
            locatedid,
            null,
            "upload",
            null,
            "uploads"
          );
        })
      );

      const uploads = await GetUploadedDocs(locatedid);
      res.json({ success: true, uploads });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* DELETE */
router.delete("/:doc_id", requiredLogged, async (req, res) => {
  const { doc_id } = req.params;
  const user_id = getUserID(req);
  if (!requiredLevel(req, res, "level", 3)) return;

  try {
    const {
      rows: [uploadRow],
    } = await pool.query(`SELECT * FROM uploads WHERE doc_id = $1`, [doc_id]);

    if (!uploadRow) return res.status(404).json({ error: "File not found" });

    await cloudinary.uploader.destroy(uploadRow.public_id);
    await pool.query("DELETE FROM uploads WHERE doc_id = $1", [doc_id]);

    await RecActivity(
      user_id,
      "delete",
      { filename: uploadRow.filename },
      {},
      "/" + uploadRow.public_id,
      uploadRow.located_id,
      null,
      "upload",
      null,
      "uploads"
    );

    const uploads = await GetUploadedDocs(uploadRow.located_id);
    res.json({ success: true, uploads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
