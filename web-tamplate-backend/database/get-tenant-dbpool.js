const { Pool } = require("pg");
const { tenantConfigs } = require("../utils/load-tenant-configs");
const dotenv = require("dotenv");
dotenv.config();
const tenantPools = new Map();

function getTenantPool(tenant) {
  if (tenantPools.has(tenant)) {
    return tenantPools.get(tenant);
  }

  const tenantConfig = tenantConfigs.get(tenant);
  if (!tenantConfig) {
    throw new Error(`Configuration not found for tenant: ${tenant}`);
  }

 const pool = new Pool({
   host: process.env.DB_HOST,
   // host: tenantConfig.host,
   user: process.env.DB_USER,
   // user: tenantConfig.user,
   password: process.env.DB_PASSWORD,
   // password: tenantConfig.password,
   database: process.env.DB_DATABASE,
   // database: tenantConfig.databasename,
   port: tenantConfig.port || 5432,
   max: 10,
   idleTimeoutMillis: 30000,
   allowExitOnIdle: true,
   keepAlive: true,
   keepAliveInitialDelayMillis: 30000, // Send keepalive after 10s
 });

  tenantPools.set(tenant, pool);
  return pool;
}

function closeTenantPools() {
  tenantPools.forEach((pool, tenant) => {
    pool.end().then(() => console.log(`Closed pool for tenant: ${tenant}`));
  });
}

process.on("SIGINT", () => {
  closeTenantPools();
  process.exit(0);
});

module.exports = { getTenantPool, closeTenantPools };
