const { Pool } = require("pg");

// const pool = new Pool({
//   user: "erpuser",
//   host: "pgm-zf825f5m9z0ji68guo.rwlb.kualalumpur.rds.aliyuncs.com",
//   database: "ceyinfoerp",
//   password: "Dbuser1#2",
//   port: 5432,
// });

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "postgres",
//   password: "Isuru12345@",
//   port: 5432,
// });

const pool = new Pool({
  user: "erpuser",
  host: "pgm-zf825f5m9z0ji68guo.rwlb.kualalumpur.rds.aliyuncs.com",
  database: "ceyinfoerp",
  password: "Dbuser1#2",
  port: 5432,
});

module.exports = pool;
