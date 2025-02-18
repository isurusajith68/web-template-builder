const { Pool } = require("pg");
const { tenantConfigs } = require("../utils/load-tenant-configs");

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
    host: tenantConfig.host,
    user: tenantConfig.user,
    password: tenantConfig.password,
    database: tenantConfig.databasename,
    port: tenantConfig.port || 5432,
    max: 10,
    idleTimeoutMillis: 30000,
    allowExitOnIdle: true,
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
