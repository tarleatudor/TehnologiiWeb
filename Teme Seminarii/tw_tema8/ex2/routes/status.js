const express = require("express");
const router = express.Router();

router.get("/status", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running correctly ",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;