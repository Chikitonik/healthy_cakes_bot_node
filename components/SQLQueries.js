// elephantsql.com
const fs = require("fs");
const pg = require("pg");
const [{ conString }] = JSON.parse(fs.readFileSync("./sqlData.json", "utf8")); //Can be found in the Details page
// const [{ conString }] = require("./sqlData.json");

const selectDataFromSQLtable = async (SQLtable) => {
  const clientElephantSql = new pg.Client(conString);
  return new Promise((resolve, reject) => {
    clientElephantSql.connect(function (err) {
      if (err) {
        return reject(console.error("could not connect to postgres", err));
      }
      clientElephantSql.query(
        `SELECT * FROM ${SQLtable}`,
        async function (err, result) {
          clientElephantSql.end();
          if (err) {
            return reject(err);
          }
          // console.log("result.rows[0]", result.rows[0]);
          // console.log("result.rows", result.rows);
          resolve(result.rows);
        }
      );
    });
  });
};

const updateDataInSQLtable = async (SQLtable, newRowValues) => {
  const columns = Object.keys(newRowValues);
  const values = Object.values(newRowValues);
  let query = "";
  if (newRowValues.id) {
    query = `UPDATE ${SQLtable} SET (${columns.join(", ")}) = (${values.map(
      (value) => `'${value}'`
    )}) WHERE id = ${newRowValues.id}`;
  } else {
    query = `INSERT INTO ${SQLtable} (${columns.join(
      ", "
    )}) VALUES (${values.map((value) => `'${value}'`)})`;
  }
  const clientElephantSql = new pg.Client(conString);

  return new Promise((resolve, reject) => {
    clientElephantSql.connect(function (err) {
      if (err) {
        return reject(console.error("could not connect to postgres", err));
      }
      clientElephantSql.query(query, async function (err, result) {
        clientElephantSql.end();
        if (err) {
          return reject(err);
        }
        // console.log("result.rows[0]", result.rows[0]);
        // console.log("result", result);
        resolve(result.rowCount ? true : false);
      });
    });
  });
};

const deleteRowFromSQLtable = async (SQLtable, id) => {
  const clientElephantSql = new pg.Client(conString);
  return new Promise((resolve, reject) => {
    clientElephantSql.connect(function (err) {
      if (err) {
        return reject(console.error("could not connect to postgres", err));
      }
      clientElephantSql.query(
        `DELETE FROM ${SQLtable} WHERE id = ${id}`,
        async function (err, result) {
          clientElephantSql.end();
          if (err) {
            return reject(err);
          }
          // console.log("result.rows[0]", result.rows[0]);
          // console.log("result", result);
          resolve(result.rowCount ? true : false);
        }
      );
    });
  });
};

const selectUser = async (username, md5Pwd) => {
  const clientElephantSql = new pg.Client(conString);

  return new Promise((resolve, reject) => {
    clientElephantSql.connect(function (err) {
      if (err) {
        return reject(console.error("could not connect to postgres", err));
      }
      clientElephantSql.query(
        `SELECT * FROM users
            WHERE username = '${username}'
            and password = '${md5Pwd}'`,
        async function (err, result) {
          clientElephantSql.end();
          if (err) {
            console.log("err :>> ", err);
            return reject(err);
          }
          // console.log("result.rows[0]", result.rows[0]);
          // console.log("result.rows", result.rows);
          resolve(result.rows);
        }
      );
    });
  });
};

const insertUser = async (username, email, md5Pwd) => {
  const clientElephantSql = new pg.Client(conString);
  return new Promise((resolve, reject) => {
    clientElephantSql.connect(function (err) {
      if (err) {
        return reject(console.error("could not connect to postgres", err));
      }
      clientElephantSql.query(
        `INSERT INTO users (username, password, email, role)
          VALUES ('${username}', '${md5Pwd}', '${email}', '2')`,
        async function (err, result) {
          clientElephantSql.end();
          if (err) {
            // return reject(console.error("error running query >>", err));
            return reject(err);
          }
          resolve(result.rows);
        }
      );
    });
  });
};

module.exports = {
  selectDataFromSQLtable,
  deleteRowFromSQLtable,
  selectUser,
  insertUser,
  updateDataInSQLtable,
};
