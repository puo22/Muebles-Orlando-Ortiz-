import mysql from "mysql2/promise";
const db = mysql.createPool({
  host: "localhost",
  user: "admin",
  password: "admin",
  database: "muebles",
});

export default db;