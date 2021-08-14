const { bot } = require('../core/bot');
const { Composer } = require('grammy');
const composer = new Composer()
const collections = require('../core/database');
const balances = collections('balances');
const bot_info = collections('bot_info')
const bonus = collections('bonus')
const data = require('../data')

const handler = async(ctx, next) => {
try {
let user = await bonus.findOne({id: ctx.from.id})
let botdb = await bot_info.findOne({token: data.bot_token})
var userBals = await balances.findOne({id: ctx.from.id})
let bon = botdb.daily_bonus
let duration = 99
if(user){
    duration = ((new Date()) - new Date(user.bonus_time))/1000/60/60;
}

if(duration >= 24){
let new_bal = userBals.balance + bon
await balances.findOneAndUpdate({id: ctx.from.id} ,{$set: { balance: new_bal}}, {upsert: true}).exec()
await bonus.findOneAndUpdate({id: ctx.from.id} ,{$set: { bonus_time: new Date()}},  {upsert: true}).exec()
await ctx.reply('*✅ Today you received '+bon+' '+botdb.bot_cur+'*\n\n_Come back tomorrow and try again. this is free bonus 🎁_',{parse_mode: 'markdown'})
}else{
var time_passed = Math.abs(duration - 24)
var hours = Math.floor(time_passed);
var minutes = Math.floor((time_passed - hours)*60)
var seconds = Math.floor(((time_passed - hours)*60-minutes)*60)
await ctx.reply('⏳ _Bonus Cooldown in '+hours+':'+minutes+':'+seconds+' hrs_',{parse_mode: 'markdown'})
}
} catch(e){
   ctx.reply('Error Happened - '+e.message) 
}
await next()
}

composer.hears('🎁 Bonus', handler)

bot.use(composer)