const { bot } = require('../core/bot');
const { Composer, InlineKeyboard } = require('grammy');
const data = require('../data')
const { Router } = require('@grammyjs/router')
const composer = new Composer()
const collections = require('../core/database')
const router = new Router((ctx) => ctx.session.step);
const bot_info = collections('bot_info')

const startWd = async(ctx, next) =>{
var keys = new InlineKeyboard()
   .text('🤑 Minimum withdraw', 'minwdset').row()
   .text('📢 Channel Post','channelpost').row()
   .text('📤 payout Channel', 'payoutcha').row()
   .text('🔙 Back To Panel', 'adminlogin')

var text = '*👮‍♂️ Welcome to Withdrawal Setting, you can setup your bot withdrawal setting*'
 
await ctx.editMessageText(text, {reply_markup: keys, parse_mode: 'markdown'})

await next()
}

const minWdSet = async(ctx, next) =>{
    let botdb = await bot_info.findOne({token: data.bot_token})
    var mainKey = new InlineKeyboard()
  .text('♻ Change Amount', 'changewd').row()
  .text('🔙 Back To Panel', 'adminlogin')
    if(!botdb){
        throw new Error('Bot database Is undefined')
    }else{
await ctx.editMessageText('*Your Currently Set Minimum Withdrawal is * - _'+botdb.min_wd+'_',{reply_markup: mainKey,parse_mode: 'markdown'})
}
await next()
}

const payoutCha = async(ctx, next) =>{
    let botdb = await bot_info.findOne({token: data.bot_token})
    var mainKey = new InlineKeyboard()
  .text('♻ Change Channel', 'changepayout').row()
  .text('🔙 Back To Panel', 'adminlogin')
    if(!botdb){
        throw new Error('Bot database Is undefined')
    }else{
await ctx.editMessageText('<b>Your Currently Set Payout Channel is </b>- <code>'+botdb.payment_channel+'</code>',{reply_markup: mainKey,parse_mode: 'html'})
}
await next()
}

const onChangewd = async(ctx, next) => {
    var text = '*Send me the new minimum withdrawal Amount Now*'
    ctx.editMessageText(text,{parse_mode: 'markdown'})
    ctx.session.step = 'changewd'

    await next()
}

const onChangePayout = async(ctx, next) => {
    var text = '*Send me the Payout Channel Now*'
    ctx.editMessageText(text,{parse_mode: 'markdown'})
    ctx.session.step = 'changepayout'

    await next()
}

router.route('changewd', async(ctx) =>{
    const msg = ctx.msg?.text ?? ''
    const amount = parseFloat(msg)
    console.log(amount)
    var keys = new InlineKeyboard()
    .text('Back To Panel', 'adminlogin');
    
if(isNaN(amount)){
await ctx.reply('This is not a valid Number, send a valid one!')
}else{
    await bot_info.findOneAndUpdate({token: data.bot_token}, { $set: {min_wd: amount.toFixed(8)}})
await ctx.reply('✅ *Withdrwal Bonus Successfully Updated*',{reply_markup: keys, parse_mode: 'markdown'})
    ctx.session.step = 'idle'
}
})

router.route('changepayout', async(ctx) =>{
    const msg = ctx.msg?.text ?? ''
    let botdb = await bot_info.findOne({token: data.bot_token})
    var keys = new InlineKeyboard()
    .text('Back To Panel', 'adminlogin');
    if(msg.charAt(0) == '@'){
      await  bot_info.findOneAndUpdate({token: data.bot_token}, {payment_channel: msg}, {new: true, upsert: true})
        await ctx.reply('✅ *Payout Channel Successfully Updated*',{reply_markup: keys, parse_mode: 'markdown'})
        ctx.session.step = 'idle'
    }else{
await ctx.reply('Invalid syntax!, make sure you add @')
    }
})

composer.callbackQuery('withdraw', startWd)
composer.callbackQuery('minwdset', minWdSet)
composer.callbackQuery('payoutcha', payoutCha)
composer.callbackQuery('channelpost', async(ctx, next)=>{
    var keys = new InlineKeyboard()
    .text('Back To Panel', 'adminlogin');
    ctx.editMessageText('I Was to Lazy to code this so just be patient', {reply_markup:keys})

    await next()
})

composer.callbackQuery('changewd', onChangewd)
composer.callbackQuery('changepayout', onChangePayout)
bot.use(router)
bot.use(composer)

