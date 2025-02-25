const { getTenantPool } = require("../database/get-tenant-dbpool");

const tenantMiddleware = async (req, res, next) => {
  try {
    const tenant = req.tenant;
    console.log(tenant)
    const pool = getTenantPool(tenant);
    await pool.query(`SET search_path TO ${tenant}`);

    req.tenantPool = pool;
    next();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

module.exports = tenantMiddleware;
