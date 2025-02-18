const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();
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

const entry_db_pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = entry_db_pool;
