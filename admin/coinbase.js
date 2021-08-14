const { bot } = require('../core/bot');
const { Composer, InlineKeyboard } = require('grammy');
const data = require('../data')
const { Router } = require('@grammyjs/router')
const composer = new Composer()
const collections = require('../core/database')
const router = new Router((ctx) => ctx.session.step);
const bot_info = collections('bot_info')

const start = async(ctx, next) =>{
let botdb = await bot_info.findOne({token: data.bot_token})
let coinbase_api = botdb.coinbase_api
let coinbase_secret = botdb.coinbase_api_secret
var text = '*✅ Your Currently Setupped Coinbase details\n\nCoinbase Api*: `'+coinbase_api+'`\n*Coinbase Secret:* `'+coinbase_secret+'`\n\n_Choose what you want to do below_'
var keys = new InlineKeyboard()
  .text('♻ Change Coinbase Api', 'coinbaseapi')
  .text('🔐 Change Api Secret', 'coinbasesecret').row()
  .text('🔙 Back to Login', 'adminlogin')

  await ctx.editMessageText(text,{reply_markup: keys, parse_mode:'markdown'})
    await next()
}

composer.callbackQuery('coinbase', start)


const setApi = async(ctx, next) =>{
    await ctx.editMessageText('*✏ Send Your new Coinbase Api Key*',{parse_mode:'markdown'})
    ctx.session.step = 'coinbaseApi'
    await next()
}

const setSecret = async(ctx, next) =>{
    await ctx.editMessageText('*✏ Send Your new Coinbase Api Secret*',{parse_mode:'markdown'})
    ctx.session.step = 'coinbaseSecret'
    await next()
}

router.route('coinbaseApi', async(ctx)=>{
    const msg = ctx.msg?.text ?? ''
    await bot_info.findOneAndUpdate({token: data.bot_token}, {$set: {coinbase_api: msg}})
    var keys = new InlineKeyboard()
    .text('Back To Panel', 'adminlogin');
    var txt = 'Coinbase Api have been succesfully Added '
await ctx.reply(txt, {reply_markup: keys})

    ctx.session.step = 'idle'
})

router.route('coinbaseSecret', async(ctx)=>{
    const msg = ctx.msg?.text ?? ''
    await bot_info.findOneAndUpdate({token: data.bot_token}, {$set: {coinbase_api_secret: msg}})
    var keys = new InlineKeyboard()
    .text('Back To Panel', 'adminlogin');
    var txt = 'Coinbase Api Secret have been succesfully Added '
await ctx.reply(txt, {reply_markup: keys})
    ctx.session.step = 'idle'
})

composer.callbackQuery('coinbaseapi', setApi)
composer.callbackQuery('coinbasesecret', setSecret)
bot.use(router)
bot.use(composer)

