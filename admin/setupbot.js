const { bot } = require('../core/bot');
const { Composer, InlineKeyboard } = require('grammy');
const data = require('../data')
const { Router } = require('@grammyjs/router')
const composer = new Composer()
const collections = require('../core/database')
const router = new Router((ctx) => ctx.session.step);
const bot_info = collections('bot_info')
//const data = require('../data')



const botset = async(ctx, next) =>{
var keys = new InlineKeyboard()
   .text('🎁 Daily Bonus Setup', 'dailybon')
   .text('👨‍👩‍👧‍👦 Refferal Bonus Set','refferset').row()
   .text('♻ Channel Setup','channelset')
   .text('🔙 Back To Panel', 'adminlogin')

await ctx.editMessageText('✅ *Welcome To Bot Main setup, you can set your bot info here*',{reply_markup: keys,parse_mode: 'markdown'})

await next()

}

const setBonus = async(ctx, next) =>{
    let botdb = await bot_info.findOne({token: data.bot_token})
    var mainKey = new InlineKeyboard()
  .text('♻ Change Amount', 'changebonus').row()
  .text('🔙 Back To Panel', 'adminlogin')
    if(!botdb){
        throw new Error('Bot database Is undefined')
    }else{
await ctx.editMessageText('*Your Currently Set 🎁 daily Bonus is * - _'+botdb.daily_bonus+'_',{reply_markup: mainKey,parse_mode: 'markdown'})
}

await next()
}

const setrefBonus = async(ctx, next) =>{
    let botdb = await bot_info.findOne({token: data.bot_token})
    var mainKey = new InlineKeyboard()
  .text('♻ Change Amount', 'changeref').row()
  .text('🔙 Back To Panel', 'adminlogin')
    if(!botdb){
        throw new Error('Bot database Is undefined')
    }else{
await ctx.editMessageText('*Your Currently Set 👨‍👩‍👧‍👦 Reffer Bonus is * - _'+botdb.reffer_bonus+'_',{reply_markup: mainKey,parse_mode: 'markdown'})
}

await next()
}

const onChangeRef = async(ctx, next) =>{
var text = '*Send me the new Reffer bonus Amount Now*'
ctx.editMessageText(text,{parse_mode: 'markdown'})
ctx.session.step = 'changeref'

await next()
}

const onChangeBons = async(ctx, next) =>{
    var text = '*Send me the new daily bonus Amount Now*'
    ctx.editMessageText(text,{parse_mode: 'markdown'})
    ctx.session.step = 'changebonus'

    await next()
    }

    router.route('changeref', async(ctx) =>{
        const msg = ctx.msg?.text ?? ''
        const amount = parseFloat(msg)
        var keys = new InlineKeyboard()
        .text('Back To Panel', 'adminlogin');
        
if(isNaN(amount)){
    ctx.reply('This is not a valid Number, send a valid one!')
}else{
    await bot_info.findOneAndUpdate({token: data.bot_token}, { reffer_bonus: amount},{new: true, upsert: true} )
    await ctx.reply('✅ *Reffer Bonus Successfully Updated*',{reply_markup: keys, parse_mode: 'markdown'})
        ctx.session.step = 'idle'
    }
})

router.route('changebonus', async(ctx) =>{
    const msg = ctx.msg?.text ?? ''
    const amount = parseFloat(msg)
    var keys = new InlineKeyboard()
    .text('Back To Panel', 'adminlogin');
if(isNaN(amount)){
await ctx.reply('This is not a valid Number, send a valid one!')
}else{
    await bot_info.findOneAndUpdate({token: data.bot_token}, { daily_bonus: amount}, {new: true, upsert: true})
await ctx.reply('✅ *Daily Bonus Successfully Updated*',{reply_markup: keys, parse_mode: 'markdown'})
    ctx.session.step = 'idle'
}
})

bot.use(router)
composer.callbackQuery('refferset', setrefBonus)
composer.callbackQuery('dailybon', setBonus)
composer.callbackQuery('changebonus', onChangeBons)
composer.callbackQuery('changeref', onChangeRef)
composer.callbackQuery('setupbot', botset)

bot.use(composer)



