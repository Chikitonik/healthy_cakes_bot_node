const fs = require("fs");
const jwt = require("jsonwebtoken");
const express = require("express");
const { ROLES, authUser, authRole } = require("./basicAuth");
const winston = require("winston");

const SQLQueries = require("./components/SQLQueries.js");

const [{ token }] = JSON.parse(fs.readFileSync("./botData.json", "utf8"));
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(token, { polling: true });
// const webAppUrl = "https://jocular-tartufo-23c9c3.netlify.app";
const webAppUrl =
  "https://dad5-2a0d-6fc2-4fa1-c400-891d-85db-5017-af5e.eu.ngrok.io/?source=telegram";

const CHAT_FOR_BOT_ORDERS_ID = "-614982099";
const CHAT_FOR_BOT_DELIVERY_ID = "-963891388";

const app = express();
app.use(express.json());
const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.json()
  ),
  transports: [
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // console.log("msg >>", msg);
  if (text === "/start") {
    await bot.sendMessage(
      chatId,
      "Hello! Press the <b>website</b> button below and make an order",
      { parse_mode: "HTML" }
      // {
      //   reply_markup: {
      //     inline_keyboard: [
      //       [{ text: "Fill the form", web_app: { url: webAppUrl + "/form" } }],
      //     ],
      //   },
      // }
    );
  }

  // if (text === "/start") {
  //   await bot.sendMessage(chatId, "Press the button below and make an order", {
  //     reply_markup: {
  //       inline_keyboard: [
  //         [{ text: "Fill the form", web_app: { url: webAppUrl + "/form" } }],
  //       ],
  //     },
  //   });
  // }
  // if (msg?.web_app_data?.data) {
  //   try {
  //     const data = JSON.parse(msg?.web_app_data?.data);
  //     // console.log(data);
  //     await bot.sendMessage(chatId, "Thanks for Your reply");
  //     await bot.sendMessage(chatId, "Your country is " + data?.country);
  //     await bot.sendMessage(chatId, "Your street is " + data?.street);

  //     setTimeout(async () => {
  //       await bot.sendMessage(
  //         chatId,
  //         "All information You will get in this chat"
  //       );
  //     }, 3000);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
});

app.get("/admin", authUser, authRole(ROLES.ADMIN), (req, res) => {
  logger.info("Admin page hit");
  return res.status(200).json({ page: "Admin" });
});

app.get("/admin/:table", async (req, res) => {
  const SQLtable = req.params.table;
  logger.info(`get admin table: ${SQLtable}`);
  try {
    const SQLtableData = await SQLQueries.selectDataFromSQLtable(SQLtable);
    res.json([{ SQLtableData }]);
  } catch (error) {
    logger.error(`error get admin table: ${SQLtable}: error?.message`);
    res.status(500).json({ error: error?.message });
  }
});

app.delete("/admin/delete/:table/:id", async (req, res) => {
  // return res.json({ page: "register" });
  const SQLtable = req.params.table;
  const id = req.params.id;
  console.log("DELETE :>> ", SQLtable, id);
  try {
    const answer = await SQLQueries.deleteRowFromSQLtable(SQLtable, id);
    answer === true
      ? res.json([{ message: "row deleted" }])
      : res.json([{ message: "error" }]);
    console.log("answer :>> ", answer);
  } catch (error) {
    console.log("error.detail :>> ", error.detail);
    res.status(500).json({ error: error?.detail });
  }
});

app.put("/admin/update/:table/:newRowValues", async (req, res) => {
  // return res.json({ page: "register" });
  const SQLtable = req.params.table;
  const newRowValues = req.params.newRowValues;
  console.log("UPDATE :>> ", SQLtable, newRowValues);
  try {
    const answer = await SQLQueries.updateDataInSQLtable(
      SQLtable,
      JSON.parse(newRowValues)
    );
    answer === true
      ? res.json([{ message: "row updated" }])
      : res.json([{ message: "error" }]);
    console.log("answer :>> ", answer);
  } catch (error) {
    res.status(500).json({ error: error?.message });
  }
});

app.put(
  "/store/carts/put/:username/:cake_id/:price_with_discount/:operation",
  async (req, res) => {
    const username = req.params.username;
    const itemId = req.params.cake_id;
    const priceWithDiscount = req.params.price_with_discount;
    const operation = req.params.operation;
    logger.info(
      `operation ${operation} to carts: username ${username} itemId ${itemId} priceWithDiscount ${priceWithDiscount}`
    );
    try {
      const answer = await SQLQueries.cartUpdate(
        username,
        itemId,
        priceWithDiscount,
        operation
      );
      answer === true
        ? res.json([{ message: "success" }])
        : res.json([{ message: "error" }]);
      logger.info(`answer: ${answer}`);
    } catch (error) {
      logger.error(`error: ${error?.message}`);
      res.status(500).json({ error: error?.message });
    }
  }
);

app.get("/cart/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const cartData = await SQLQueries.selectCartData(username);
    res.json([{ cartData }]);
  } catch (error) {
    res.status(500).json({ error: error?.message });
  }
});

app.get("/cart/count/:username", async (req, res) => {
  const username = req.params.username;
  logger.info(`Select rows count from carts, user ${username}`);
  try {
    const countRows = await SQLQueries.selectCartRowsCount(username);
    res.json([{ countRows }]);
  } catch (error) {
    logger.error(`error: ${error?.message}`);
    res.status(500).json({ error: error?.message });
  }
});

app.get("/orders/:username", async (req, res) => {
  const username = req.params.username;
  logger.info(`Select rows from orders, user ${username}`);
  try {
    const ordersData = await SQLQueries.selectOrdersData(username);
    res.json([{ ordersData }]);
  } catch (error) {
    logger.error(`error: ${error?.message}`);
    res.status(500).json({ error: error?.message });
  }
});

app.get(
  "/orders_all/:is_ready/:is_delivering/:is_delivered",
  async (req, res) => {
    const is_ready = req.params.is_ready;
    const is_delivering = req.params.is_delivering;
    const is_delivered = req.params.is_delivered;
    logger.info(`Select rows from all orders`);
    try {
      const ordersData = await SQLQueries.selectAllOrdersData(
        is_ready,
        is_delivering,
        is_delivered
      );
      res.json([{ ordersData }]);
    } catch (error) {
      logger.error(`error: ${error?.message}`);
      res.status(500).json({ error: error?.message });
    }
  }
);

app.get("/orders_position/:ordersId", async (req, res) => {
  const ordersId = req.params.ordersId;
  logger.info(`Select rows from orders_position, irders ${ordersId}`);
  try {
    const ordersData = await SQLQueries.selectOrdersPositionsData(ordersId);
    res.json([{ ordersData }]);
  } catch (error) {
    logger.error(`error: ${error?.message}`);
    res.status(500).json({ error: error?.message });
  }
});

// app.get("/orders/count/:username", async (req, res) => {
//   const username = req.params.username;
//   logger.info(`Select rows count from orders_header, user ${username}`);
//   try {
//     const countRows = await SQLQueries.selectOrdersRowsCount(username);
//     res.json([{ countRows }]);
//   } catch (error) {
//     logger.error(`error: ${error?.message}`);
//     res.status(500).json({ error: error?.message });
//   }
// });

app.put(
  "/cart/create_order/:username/:addressId/:totalSum/:positionsData/:cartRowsID",
  async (req, res) => {
    const username = req.params.username;
    const addressId = req.params.addressId;
    const totalSum = req.params.totalSum;
    const positionsData = req.params.positionsData;
    const cartRowsID = req.params.cartRowsID;
    logger.info(`Create order, user ${username}`);
    try {
      const id = await SQLQueries.createOrder(
        username,
        addressId,
        totalSum,
        positionsData,
        cartRowsID
      );
      await bot.sendMessage(
        CHAT_FOR_BOT_ORDERS_ID,
        `User ${username}\nmade an order id ${id} total sum ${totalSum}`
      );
      res.json([{ id }]);
    } catch (error) {
      logger.error(`error: ${error?.message}`);
      res.status(500).json({ error: error?.message });
    }
  }
);

app.put(
  "/telegram_order_create/:username/:addressId/:totalSum/:positionsData",
  async (req, res) => {
    const username = req.params.username;
    const addressId = req.params.addressId;
    const totalSum = req.params.totalSum;
    const positionsData = req.params.positionsData;
    logger.info(`Create order, user ${username}`);
    try {
      const id = await SQLQueries.createOrderTelegram(
        username,
        addressId,
        totalSum,
        positionsData
      );
      await bot.sendMessage(
        CHAT_FOR_BOT_ORDERS_ID,
        `User ${username}\nmade an order id ${id} total sum ${totalSum}`
      );
      res.json([{ id }]);
    } catch (error) {
      logger.error(`error: ${error?.message}`);
      res.status(500).json({ error: error?.message });
    }
  }
);

app.put("/orders/set_status/:id/:column/:sum/:address", async (req, res) => {
  const id = req.params.id;
  const column = req.params.column;
  const sum = req.params.sum;
  const address = req.params.address;
  try {
    const answer = await SQLQueries.updateOrderStatus(column, id);
    answer === true
      ? res.json([{ message: "status updated" }])
      : res.json([{ message: "error" }]);
    // console.log("answer :>> ", answer);
    if (column === "is_ready") {
      await bot.sendMessage(
        CHAT_FOR_BOT_DELIVERY_ID,
        `Order id: ${id}, sum: ${sum}, address: ${address} is ready for delivery`
      );
    }
    // res.json([{ id }]);
  } catch (error) {
    res.status(500).json({ error: error?.message });
  }
});

app.get("/settings/:username", async (req, res) => {
  const username = req.params.username;
  logger.info(`Select rows from users, user ${username}`);
  try {
    const userData = await SQLQueries.selectUserData(username);
    res.json([{ userData }]);
  } catch (error) {
    logger.error(`error: ${error?.message}`);
    res.status(500).json({ error: error?.message });
  }
});

app.get("/settings/address/:username", async (req, res) => {
  const username = req.params.username;
  logger.info(`Select rows from customer_address, user ${username}`);
  try {
    const userAddress = await SQLQueries.selectCustomerAddress(username);
    res.json([{ userAddress }]);
  } catch (error) {
    logger.error(`error: ${error?.message}`);
    res.status(500).json({ error: error?.message });
  }
});

app.put("/settings/update/:table/:row", async (req, res) => {
  const row = req.params.row;
  const table = req.params.table;
  logger.info(`UPDATE , ${table}, ${row}`);
  try {
    const answer = await SQLQueries.updateDataInSQLtable(
      table,
      JSON.parse(row)
    );
    answer === true
      ? res.json([{ message: "row updated" }])
      : res.json([{ message: "error" }]);
    logger.info(`answer: ${answer}`);
  } catch (error) {
    logger.error(`${error?.message}`);
    res.status(500).json({ error: error?.message });
  }
});

app.get("/user", async (req, res) => {
  // return res.json({ page: "register" });
  try {
    const user = await SQLQueries.selectUser();
    res.json([{ user }]);
  } catch (error) {
    res.status(500).json({ error: error?.message });
  }
});
app.post("/login", async (req, res) => {
  // return res.json({ page: "register" });
  console.log("req.body :>> ", req.body);
  try {
    const result = await SQLQueries.selectUser(req.body.user, req.body.md5Pwd);
    // const accessToken = jwt.sign(
    //   { username: result[0].username },
    //   process.env.ACCESS_TOKEN_SECRET,
    //   { expiresIn: "15m" }
    // );
    // const refreshToken = jwt.sign(
    //   { username: result[0].username },
    //   process.env.REFRESH_TOKEN_SECRET,
    //   { expiresIn: "7d" }
    // );

    res.json([{ result }]);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error });
  }
});
app.post("/register", async (req, res) => {
  // return res.json({ page: "register" });
  try {
    const result = await SQLQueries.insertUser(
      req.body.user,
      req.body.email,
      req.body.md5Pwd
    );
    res.json([{ result }]);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.post("/web-data", async (req, res) => {
  const { queryId, products, totalPrice, user } = req.body;
  try {
    await bot.sendMessage(
      CHAT_FOR_BOT_ORDERS_ID,
      `User @${
        user.username
      }\npurchased goods worth $ ${totalPrice}: \n - ${products
        .map((item) => `${item.title} - $ ${item.price}`)
        .join("\n - ")}`
    );
    // return res.status(200).json({});
  } catch (e) {
    console.log("e :>> ", e);
  }
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "successful purchase",
      input_message_content: {
        message_text: `You purchased goods worth $ ${totalPrice}: \n - ${products
          .map((item) => `${item.title} - $ ${item.price}`)
          .join(
            "\n - "
          )}\nThank you for your order!\nWe will contact you soon.`,
      },
    });
    return res.status(200).json({});
  } catch (e) {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "purchase failed",
      input_message_content: {
        message_text: "purchase failed",
      },
    });
    return res.status(500).json({});
  }
});

const PORT = 8000;
app.listen(PORT, () => logger.info("server started on " + PORT));
