const fs = require("fs");
const jwt = require("jsonwebtoken");
const express = require("express");
const { ROLES, authUser, authRole } = require("./basicAuth");

const [{ token }] = JSON.parse(fs.readFileSync("./botData.json", "utf8"));
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(token, { polling: true });
// const webAppUrl = "https://jocular-tartufo-23c9c3.netlify.app";
const webAppUrl =
  "https://72be-2a0d-6fc2-4fa0-f00-8994-5ec0-6bda-ddca.eu.ngrok.io";

const CHAT_FOR_BOT_REPLY_ID = "-614982099";

const app = express();
app.use(express.json());
const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// elephantsql.com
const pg = require("pg");
const [{ conString }] = JSON.parse(fs.readFileSync("./sqlData.json", "utf8")); //Can be found in the Details page
//#region --------------------users-----------------------------
const selectAllUsers = async () => {
  const clientElephantSql = new pg.Client(conString);
  return new Promise((resolve, reject) => {
    clientElephantSql.connect(function (err) {
      if (err) {
        return reject(console.error("could not connect to postgres", err));
      }
      clientElephantSql.query(
        "SELECT * FROM users",
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
//#endregion

/////////////////////
// app.use(setUser);

// function setUser(req, res, next) {
//   const role = req.body.user.role;
//   if (role) {
//     req.user = users.find((user) => user.role === role);
//   }
//   next();
// }

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
  return res.status(200).json({ page: "Admin" });
});

app.get("/users", async (req, res) => {
  // return res.json({ page: "register" });
  try {
    const users = await selectAllUsers();
    res.json([{ users }]);
    // console.log("users :>> ", users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/user", async (req, res) => {
  // return res.json({ page: "register" });
  try {
    const user = await selectUser();
    res.json([{ user }]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/login", async (req, res) => {
  // return res.json({ page: "register" });
  console.log("req.body :>> ", req.body);
  try {
    const result = await selectUser(req.body.user, req.body.md5Pwd);
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
    const result = await insertUser(
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
      CHAT_FOR_BOT_REPLY_ID,
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
app.listen(PORT, () => console.log("server started on " + PORT));
