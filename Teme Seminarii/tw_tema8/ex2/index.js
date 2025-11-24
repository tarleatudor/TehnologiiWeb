"use strict";

const express = require("express");
require("dotenv").config();

const app = express();

const logger = require("./middlewares/logger");
const erorrStack = require("./middlewares/errStack");

const departmentRouter = require("./routes/department");
const statusRouter = require("./routes/status");

app.use(logger);
app.use("/api", departmentRouter);
app.use("/api", statusRouter);

app.use(erorrStack);

app.use((err, req, res, next) => {
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message
    });
});
app.set("port", process.env.PORT || 7000);

app.listen(app.get("port"), () => {
  console.log(`Server started on http://localhost:${app.get("port")}`);
});
