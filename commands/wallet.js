const { bot } = require('../core/bot');
const { Composer, InlineKeyboard, Keyboard } = require('grammy');
const composer = new Composer()
const collections = require('../core/database');
const users = collections('users');
const { Router } = require('@grammyjs/router')
const router = new Router((ctx) => ctx.session.step);

const { createMenu } = require('../handlers/menuHandler')


const wallet = async(ctx, next) => {
let user = await users.findOne({id: ctx.from.id})
const button = new InlineKeyboard()
        .text('Change Email', 'emailset')
if(user){
const wallet = user.coinbase_mail || 'not set'
await ctx.reply('💡 *Your Coinbase Email is:* `'+wallet+'`',{reply_markup: button, parse_mode: 'markdown'})
}
await next()
}

const setEmail = async(ctx, next) =>{
var key = new Keyboard()
   .text('🔙 Back');
    ctx.session.step = 'setemail'
    ctx.deleteMessage()
await ctx.reply('✏ *Send now your Coinbase Email* to use in future withdrawals!',{reply_markup: { keyboard: key.build(), resize_keyboard: true}, parse_mode: 'markdown'})

await next()
}


composer.hears('🔙 Back', async(ctx, next)=>{
await createMenu(ctx, 'start')
ctx.session.step = 'idle'

await next()
})

router.route('setemail', async(ctx) =>{
const wall = ctx.msg?.text ?? ''
if((wall == '/start') ||( wall == '🔙 Back' )){
    await createMenu(ctx, 'start')
    ctx.session.step = 'idle'

}else{
var key = new Keyboard()
   .text('🔙 Back');
let email_test =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
if(email_test.test(wall)){
let check = await users.findOne({coinbase_mail: wall})
if(!check){
await ctx.reply('🖊* Done:* Your new coinbase email is\n`'+wall+'`',{ reply_markup: { keyboard: key.build(), resize_keyboard: true}, parse_mode: 'markdown'})
await users.findOneAndUpdate({id: ctx.from.id}, {$set: { coinbase_mail: wall}})
}else{
    await ctx.reply('Seems This email have been used in bot before by another user! Try Again')
}
}else{
    await ctx.reply('🖊 Error: This is not a valid email! Send /start to return to the menu, or send a correct one')
}}
})




composer.callbackQuery('emailset', setEmail);
composer.hears('🗳 Wallet', wallet)
bot.use(router)
bot.use(composer)
