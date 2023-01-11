const fs = require("fs");

const token = JSON.parse(fs.readFileSync("./botData.json", "utf8"))[0].token;
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(token, { polling: true });

const webAppUrl = "https://jocular-tartufo-23c9c3.netlify.app";

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

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
