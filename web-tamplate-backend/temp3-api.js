const express = require("express");

const router = express.Router();

router.get("/temp3", (req, res) => {
  res.json({ message: "temp3" });
});

module.exports = router;
