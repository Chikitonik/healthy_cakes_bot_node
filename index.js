const fs = require("fs");
const express = require("express");
const cors = require("cors");

const [{ token }] = JSON.parse(fs.readFileSync("./botData.json", "utf8"));
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(token, { polling: true });

const app = express();
app.use(express.json());
app.use(cors());

// const webAppUrl = "https://jocular-tartufo-23c9c3.netlify.app";
const webAppUrl = "https://6944-87-68-157-52.eu.ngrok.io";

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  console.log("msg >>", msg);

  if (text === "/start") {
    await bot.sendMessage(chatId, "Press the button below and make an order", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Fill the form", web_app: { url: webAppUrl + "/form" } }],
        ],
      },
    });
  }
  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      console.log(data);
      await bot.sendMessage(chatId, "Thanks for Your reply");
      await bot.sendMessage(chatId, "Your country is " + data?.country);
      await bot.sendMessage(chatId, "Your street is " + data?.street);

      setTimeout(async () => {
        await bot.sendMessage(
          chatId,
          "All information You will get in this chat"
        );
      }, 3000);
    } catch (e) {
      console.log(e);
    }
  }
});

app.post("/web-data", async (req, res) => {
  const { queryId, products, totalPrice } = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "successful purchase",
      input_message_content: {
        message_text: `You purchased goods worth ${totalPrice}, ${products
          .map((item) => item.title)
          .join(", ")}`,
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
