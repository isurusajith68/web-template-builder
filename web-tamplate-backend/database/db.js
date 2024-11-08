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

const createTable = `CREATE TABLE webtemplatedata (
    id SERIAL PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    templateId VARCHAR(255) NOT NULL,
    details JSONB NOT NULL
);`;

pool
  .query(createTable)
  .then((Response) => {
    console.log("table created");
  })
  .catch((err) => {
    console.log("error table exist ");
  });

module.exports = pool;
