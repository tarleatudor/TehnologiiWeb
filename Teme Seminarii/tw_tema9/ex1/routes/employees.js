const Employee = require("../models/employee");
const { Op } = require("sequelize");
const router = require("express").Router();

router
  .route("/employees")
  .get(async (req, res) => {
    try {
      const { minSalary, firstName, sortBy, order, simplified } = req.query;

      const whereClause = {};

      if (minSalary) {
        whereClause.salary = { [Op.gte]: parseFloat(minSalary) };
      }

      if (firstName) {
        whereClause.firstName = { [Op.substring]: firstName };
      }

      let orderClause = undefined;

      if (sortBy) {
        const sortOrder =
          order && ["ASC", "DESC"].includes(order.toUpperCase())
            ? order.toUpperCase()
            : "ASC";

        orderClause = [[sortBy, sortOrder]];
      }

      const employees = await Employee.findAll({
        where: whereClause,
        attributes: simplified ? { exclude: ["id"] } : undefined,
        order: orderClause,
      });

      return res.status(200).json(employees);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  })
  .post(async (req, res) => {
    try {
      const newEmployee = await Employee.create(req.body);
      return res.status(200).json(newEmployee);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

router
  .route("/employees/:id")
  .get(async (req, res) => {
    try {
      const employees = await Employee.findByPk(req.params.id);
      if (employees) {
        return res.status(200).json(employees);
      } else {
        return res.status(404).json({ error: "Employee not found" });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  })
  .put(async (req, res) => {
    try {
      const employees = await Employee.findByPk(req.params.id);
      if (employees) {
        const updatedEmployee = await employees.update(req.body);
        return res.status(200).json(updatedEmployee);
      } else {
        return res.status(404).json({ error: "Employee not found" });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const employees = await Employee.findByPk(req.params.id);
      if (employees) {
        await employees.destroy();
        return res.status(200).json({ message: "Employee deleted successfully" });
      } else {
        return res.status(404).json({ error: "Employee not found" });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
