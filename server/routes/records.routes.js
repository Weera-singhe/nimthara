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
    console.log("records");
    res.json({ success: true });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
