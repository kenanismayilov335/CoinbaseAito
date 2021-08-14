const { Bot, Keyboard, Router, session } = require('grammy');
const data = require('../data')
const bot = new Bot(data.bot_token);
const{ helper } = require('./helper')
bot.use(session({ initial: () => ({ step: 'idle'})}));
const { sequentialize, run } = require("@grammyjs/runner");

async function responseTime(ctx,next){
  const before = Date.now(); // milliseconds
  // invoke downstream middleware
  await next(); // make sure to `await`!
  // take time after
  const after = Date.now(); // milliseconds
  // log difference
  console.log(`Response time: ${after - before} ms`);
}

//bot.use(responseTime);

bot.use(helper)

bot.catch(err => console.log(err))

//bot.start();
run(bot)
module.exports = {bot, Keyboard, Router, Bot}