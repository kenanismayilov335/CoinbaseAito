const { bot } = require('../core/bot');
const { Composer } = require('grammy');
const composer = new Composer()
//const { createMenu } = require('../handlers/menuHandler');
const { textFormat } = require('../handlers/errorHandler');
const collections = require('../core/database')
const referData = collections('referData')
const balances = collections('balances')
const { findUser, mustJoin } = require('../handlers/channelHandler')
const { createMenu } = require('../handlers/menuHandler');
const bot_info = collections('bot_info')
const data = require('../data')

const joined = async (ctx, next) => {
try{
let inChannel = await findUser(ctx)
if(inChannel){
await createMenu(ctx, 'start')
const userRefs = await referData.findOne({id: ctx.from.id})
if(userRefs && userRefs.refferal_id && userRefs.paid_for_refer == 'nope'){
let bal = await balances.findOne({id: userRefs.refferal_id})
if(bal){
   let botdb = await bot_info.findOne({token: data.bot_token})
   let bb = bal.balance+botdb.reffer_bonus
   await balances.findOneAndUpdate({id: userRefs.refferal_id} ,{$set: { balance: bb}}).exec()
   let text = '➕ *You earned '+botdb.reffer_bonus+' '+botdb.bot_cur+' from a refferal*'
 await ctx.api.sendMessage(userRefs.refferal_id,text,{parse_mode: 'markdown'})
 await referData.findOneAndUpdate({id: ctx.from.id} ,{$set: { paid_for_refer: 'yeah'}}).exec()
}
}
}else{
await mustJoin(ctx)
}
} catch(e){
   ctx.reply('Error Happened - '+e.message) 
}

await next()
}



composer.hears('✅ Joined', joined)

bot.use(composer)