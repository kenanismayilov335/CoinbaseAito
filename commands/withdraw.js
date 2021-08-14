const { create_witdrawal } = require('../libs/coinbaseLib')
const { bot } = require('../core/bot');
const { Composer, InlineKeyboard, Keyboard } = require('grammy');
const data = require('../data')
const { Router } = require('@grammyjs/router')
const composer = new Composer()
const collections = require('../core/database')
const router = new Router((ctx) => ctx.session.step);
const bot_info = collections('bot_info')
//const data = require('../data')
const balances = collections('balances')
const users = collections('users')
const stats = collections('stat');

const startWd = async(ctx, next) =>{
let bal = await balances.findOne({id: ctx.from.id})
let botdb = await bot_info.findOne({token: data.bot_token})
let min_wd = botdb.min_wd
let user = await users.findOne({id: ctx.from.id})
let mail = user.coinbase_mail
let balance = bal.balance
if(mail == 'not set'){
    const button = new InlineKeyboard()
        .text('Change Email', 'emailset')
    await ctx.reply('💡 *Your Coinbase Email is:* `'+mail+'`',{reply_markup: button, parse_mode: 'markdown'})
}else if(balance<min_wd){
await ctx.reply('❌ *You have to own at least '+min_wd.toFixed(8)+' '+botdb.bot_cur+' in your balance to withdraw!*', {parse_mode: 'markdown'})
}else{
var button = new Keyboard()
    .text('🔙 Back')
    var post="📤 *How many "+botdb.bot_cur+" you want to withdraw?*\n\n    *Minimum:* "+min_wd.toFixed(8)+" "+botdb.bot_cur+"\n    *Maximum:* "+balance.toFixed(8)+" "+botdb.bot_cur+"\n    _Maximum amount corresponds to your balance_\n\n    ➡* Send now the amount of  you want to withdraw*"
ctx.session.step = 'withdraw'
    ctx.reply(post,{reply_markup:{keyboard: button.build(), resize_keyboard: true}, parse_mode:'markdown'})
}

await next()
}

composer.hears('💰 Withdraw', startWd)

router.route('withdraw', async(ctx)=>{
    const msg = ctx.msg?.text ?? ''
    const amount = parseFloat(msg)
    let bal = await balances.findOne({id: ctx.from.id})
let botdb = await bot_info.findOne({token: data.bot_token})
let botStat = await stats.findOne({id: 'newbot'})
let total_wd = botStat.total_withdrawn
let min_wd = botdb.min_wd
let user = await users.findOne({id: ctx.from.id})
let mail = user.coinbase_mail
let balance = bal.balance
    if(isNaN(amount)){
        ctx.reply('❌ This is not a valid Number, send a valid one!')
        }else{
if(balance >= min_wd && amount >= min_wd && amount <= balance){
let new_bal = balance - amount
let new_stat = total_wd + amount
let new_wd = bal.withdrawn + amount
await balances.findOneAndUpdate({id: ctx.from.id}, {$set: {balance: new_bal, withdrawn: new_wd}})
await stats.findOneAndUpdate({id: 'newbot'}, {$set: {total_withdrawn: new_stat}})
await create_witdrawal(amount, mail, botdb.bot_cur, data.bot_name)

var sub_mail = mail.split('@')
var first_sub = sub_mail[0];
var second_sub = sub_mail[1];
var new_str;
var str = first_sub.trim();
var new_str = ''
for(var index in str){
    if(index >= str.length -5){
    new_str += '*'
    }else{
        new_str += str[index]
    }
}

var new_mail = new_str+'@'+second_sub
var payout = botdb.payment_channel
ctx.reply('💴 <b>Your withdraw has been sent!\n💰 Check your Coinbase wallet!\n✅ Check '+data.payment_channel+'</b>',{parse_mode: 'html'})
ctx.api.sendMessage(payout,
'📤 <b>New Instant Withdraw</b> 📤\n\n☉ <b>Status:</b>  <code>PAID</code>\n☉ <b>User Id:</b> <code>'+ctx.from.id+'</code>\n☉ <b>Amount:</b> <code>'+amount+' '+data.currency+'</code>\n\n🪔 <b>Paid Coinbase Email</b> 🪔 \n<code>'+new_mail+'</code>\n\n🎊 <b>Bot</b> @'+data.bot_name,{parse_mode: 'html'})
ctx.session.steps = 'idle'
}else{
await ctx.reply("😐 Send a value over *"+min_wd+" "+botdb.bot_cur+"* but not greater than *"+balance.toFixed(8)+" "+botdb.bot_cur+"*",{parse_mode: 'markdown'})
}
        }
})

bot.use(router)
bot.use(composer)