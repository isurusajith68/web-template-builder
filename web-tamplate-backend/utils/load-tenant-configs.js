const entry_db_pool = require("../database/db.js");

const tenantConfigs = new Map();

const loadTenantConfigs = async () => {
  try {
    const { rows } = await entry_db_pool.query("SELECT * FROM organizations");

    console.log("Loading tenant configurations...");

    rows.forEach((row) => {
      tenantConfigs.set(row.label, {
        host: row.host,
        user: row.dbuser,
        password: row.dbpassword,
        databasename: row.databasename,
        label: row.label,
        id: row.id,
      });
    });

    console.log("Tenant configurations loaded successfully.");
  } catch (error) {
    console.error("Error loading tenant configurations:", error);
  }

  return tenantConfigs;
};

module.exports = { loadTenantConfigs, tenantConfigs };
