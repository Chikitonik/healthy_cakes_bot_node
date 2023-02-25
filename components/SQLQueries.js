// elephantsql.com
const fs = require("fs");
const pg = require("pg");
const [{ conString }] = JSON.parse(fs.readFileSync("./sqlData.json", "utf8")); //Can be found in the Details page
// const [{ conString }] = require("./sqlData.json");

const querySQL = async (query, handler) => {
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
        resolve(handler(result));
      });
    });
  });
};

const selectDataFromSQLtable = async (SQLtable) => {
  const query = `SELECT * FROM ${SQLtable}`;
  return querySQL(query, (result) => result.rows);
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
  return querySQL(query, (result) => (result.rowCount ? true : false));
};

const deleteRowFromSQLtable = async (SQLtable, id) => {
  return querySQL(`DELETE FROM ${SQLtable} WHERE id = ${id}`, (result) =>
    result.rowCount ? true : false
  );
};

const selectUser = async (username, md5Pwd) => {
  return querySQL(
    `SELECT * FROM users
            WHERE username = '${username}'
            and password = '${md5Pwd}'`,
    (result) => result.rows
  );
};

const insertUser = async (username, email, md5Pwd) => {
  return querySQL(
    `INSERT INTO users (username, email, password)
            VALUES ('${username}', '${email}', '${md5Pwd}')`,
    (result) => (result.rowCount ? true : false)
  );
};

const cartUpdate = async (username, itemId, priceWithDiscount, operation) => {
  let query = "";
  if (operation === "add") {
    query = `INSERT INTO carts (username, cake_id, price_with_discount, amount)
    VALUES ('${username}', '${itemId}', '${priceWithDiscount}', '1')`;
  } else if (operation === "del") {
    query = `DELETE FROM carts WHERE username = '${username}' and cake_id=${itemId} and price_with_discount=${priceWithDiscount} AND id IN (
      SELECT id
      FROM carts
      WHERE username = '${username}'
      AND cake_id = ${itemId}
      AND price_with_discount = ${priceWithDiscount}
      LIMIT 1
    );`;
  }

  return querySQL(query, (result) => result.rows);
};

const selectCartData = async (username) => {
  return querySQL(
    `SELECT * FROM carts
    WHERE username = '${username}'`,
    (result) => result.rows
  );
};

const selectCartRowsCount = async (username) => {
  return querySQL(
    `SELECT count(*) FROM carts
    WHERE username = '${username}'`,
    (result) => result.rows
  );
};

module.exports = {
  selectDataFromSQLtable,
  deleteRowFromSQLtable,
  selectUser,
  insertUser,
  updateDataInSQLtable,
  cartUpdate,
  selectCartData,
  selectCartRowsCount,
};
