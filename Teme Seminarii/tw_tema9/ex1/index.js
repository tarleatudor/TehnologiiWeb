"use strict";
const express = require("express");
const sequelize = require("./sequelize");

const app = express();

app.use(
  express.urlencoded({ extended: true })
)

app.use(express.json());

app.use("/api", require("./routes/employees"));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.set("port", process.env.PORT || 7000);


app.listen(app.get("port"), async () => {
  console.log(`Server started on port ${app.get("port")}`);
  try{
     await sequelize.authenticate();
     console.log("Connection has been established successfully.");

     await sequelize.sync();  
     console.log("Models synchronized with database.");
  }catch(error){
    console.error("Unable to connect to the database:", error);
  }
});