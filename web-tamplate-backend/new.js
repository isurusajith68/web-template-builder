import express from "express";
import pool from "./database/db";

const app = express();

app.get("/schemas", (req, res) => {
  pool.query("SELECT * FROM schemas", (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
