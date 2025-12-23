const express = require("express");
const { loadTenantConfigs } = require("./utils/load-tenant-configs.js");
const utils = express.Router();

utils.get("/load-tenant-configs", async (req, res) => {
  try {
    console.log("load tenent config...");
    await loadTenantConfigs();
    res.status(200).json({ message: "Tenant configs loaded successfully" });
  } catch (error) {
    console.error("Error loading tenant configs:", error);
    res.status(500).json({ error: "Failed to load tenant configs" });
  }
});

module.exports = utils;
