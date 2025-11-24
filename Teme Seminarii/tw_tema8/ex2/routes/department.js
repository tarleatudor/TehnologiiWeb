const express = require('express');
const { departments } = require('../db');
const router = express.Router();

const checkId = (req, res, next) => {
    if(req.params.id && isNaN(req.params.id)){
        res.status(400).json({
            error: "Invalid id",
            message: "Id should be a number."
        });
    } else {
        next();
    }
};

router.get("/departments", (req, res) => {
    res.status(200).json(departments);
    throw new Error("test error");
  
});

router.get("/boom", (req, res) => {
  throw new Error("Test error2");
});

router.get("/departments/:id", (req, res) => {
  const department = departments.find(
    (department) => department.id === Number(req.params.id)
  );

  if (department) {
    res.status(200).json(department);
  } else {
    res.status(404).json({ error: "Entity not found" });
  }
});

module.exports = router;