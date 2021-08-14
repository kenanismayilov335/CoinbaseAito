const { bot } = require('../core/bot');
const { Composer, InlineKeyboard } = require('grammy');
const data = require('../data')
const composer = new Composer()
const { createMenu } = require('../handlers/menuHandler');



const adminlogin = async(ctx, next) =>{
    const button = new InlineKeyboard()
    .text('🗳 Coinbase Setup', 'coinbase').text('📤 Withdraw Setup', 'withdraw').row()
    .text('🤖 Bot Setup', 'setupbot').text('📢 Broadcast','broadcastnow').row()
    .text('🔐 Logout Panel', 'logout')
    if(!data.admin){
        ctx.reply('*😥 Bot does not have any admin*',{ parse_mode:'markdown'})
    }else if(ctx.from.id == data.admin){
        ctx.reply('👮‍♂️ Welcome to the admin Panel',{ reply_markup: button, parse_mode:'markdown'})
    }else{
        await createMenu(ctx,"start");
    }
    await next()
}

const logout = async (ctx, next) =>{
    await ctx.deleteMessage()
    await next()
}

const adminlog = async(ctx, next) =>{
    const button = new InlineKeyboard()
    .text('🗳 Coinbase Setup', 'coinbase').text('📤 Withdraw Setup', 'withdraw').row()
    .text('🤖 Bot Setup', 'setupbot').text('📢 Broadcast','broadcastnow').row()
    .text('🔐 Logout Panel', 'logout')

    await ctx.editMessageText('👮‍♂️ Welcome to the admin Panel',{ reply_markup: button, parse_mode:'markdown'})
    await next()
}

composer.command('adminlogin', adminlogin)

composer.callbackQuery('adminlogin', adminlog)
composer.callbackQuery('logout', logout)



bot.use(composer)