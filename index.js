const fs = require("fs");

const token = JSON.parse(fs.readFileSync("./botData.json", "utf8"))[0].token;
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(token, { polling: true });

const webAppUrl = "https://google.com";

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    await bot.sendMessage(chatId, "Press the button below and make an order", {
      reply_markup: {
        // keyboard: [[{ text: "Fill the form" }]],
        inline_keyboard: [
          [{ text: "Fill the form", web_app: { url: webAppUrl } }],
        ],
      },
    });
  }
});
