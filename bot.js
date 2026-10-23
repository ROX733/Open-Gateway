const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const User = require('./models/User');

if(!process.env.TELEGRAM_BOT_TOKEN){
  console.log('No bot token');
  module.exports = {};
  return;
}

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling:true});

bot.onText(/\/start/, async (msg)=>{
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
`🚀 Welcome to MyGateway Wallet!

Commands:
/balance - Check balance
/send - Transfer money
/link <email> - Link your account
/history - Last transactions
/help - Help

First register on website then link here.`);
});

bot.onText(/\/link (.+)/, async (msg, match)=>{
  const chatId = msg.chat.id;
  const email = match[1].trim();
  const user = await User.findOne({email});
  if(!user) return bot.sendMessage(chatId, '❌ Email not found. Register on website first.');
  user.telegramId = chatId.toString();
  await user.save();
  bot.sendMessage(chatId, `✅ Linked! Your balance: ${user.balance} Rs`);
});

bot.onText(/\/balance/, async (msg)=>{
  const user = await User.findOne({telegramId: msg.chat.id.toString()});
  if(!user) return bot.sendMessage(msg.chat.id, '❌ First /link your email. Example: /link admin@mygateway.com');
  bot.sendMessage(msg.chat.id, `💰 Balance: ${user.balance} Rs\nEmail: ${user.email}`);
});

bot.onText(/\/help/, (msg)=>{
  bot.sendMessage(msg.chat.id, 'Use /link email to connect, /balance to check balance, /send to transfer via website');
});

console.log('Telegram bot polling started');
module.exports = bot;
