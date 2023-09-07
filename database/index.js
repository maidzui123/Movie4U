const dotenv = require('dotenv').config('../.env');
var mysql = require('mysql2/promise');
var dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'cinema_management',
//   port: process.env.DATABASE_PORT || 3306,
};

async function queryParams(sql, params) {
  var con = await mysql.createConnection(dbConfig);
  const [results, ] = await con.execute(sql, params);
  return results;
}

async function query(sql) {
  var con = await mysql.createConnection(dbConfig);
  const [results, ] = await con.execute(sql);
  return results;
}

// query transaction like insert, update, delete
async function queryTransaction(sql, params) {
  var con = await mysql.createConnection(dbConfig);
  await con.beginTransaction();
  try {
    const [results, ] = await con.execute(sql, params);
    await con.commit();
    return results;
  } catch (error) {
    await con.rollback();
    throw error;
  }
}

module.exports = {
  query , queryParams, queryTransaction
}