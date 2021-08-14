const { bot } = require('../core/bot');
const { Composer, InlineKeyboard, } = require('grammy');
const data = require('../data')
const composer = new Composer()
const { Router } = require('@grammyjs/router')
const router = new Router((ctx) => ctx.session.step);
const collections = require('../core/database');
const bot_info = collections('bot_info');



var chaStart = async(ctx, next) =>{
    let botdb = await bot_info.findOne({token: data.bot_token})
    if(!botdb){
        throw new Error('Bot database Is undefined')
    }else{
        var channel = botdb.channelsList
        if(channel.length === 0){
var keys = new InlineKeyboard()
   .text('➕ Add Channels', 'addchannel').row()
   .text('🔙 Back To Panel', 'adminlogin')

await ctx.editMessageText('😶 You have not added any channel, click the button below to add', {reply_markup: keys})
        }else{
            var keys = new InlineKeyboard()
            .text('➕ Add/Remove a Channel', 'managechannel').row()
            .text('🆕 Add New Channels', 'addchannel')
            .text('➖ Remove All Channels', 'removeall').row()
            .text('⬅ Back To Panel', 'adminlogin')
let channels = ''
channel.forEach(getChannel)

function getChannel(value, index, array){
channels += value + '\n'
}
let text = '<b>This are You currently setupChannels</b>\n\n<i>'+channels+'</i>\n\n<b>Choose what you will like to do below</b>'
await ctx.editMessageText(text, {reply_markup: keys, parse_mode: 'html'})
}
}
await next()
}

const addChannel = async(ctx, next) =>{
await ctx.deleteMessage()
await ctx.reply('Okay Admin send me all the Channels you want to add\n\nUse , to add multiple channels')
ctx.session.step = 'addchannel'

await next()
}

router.route('addchannel', async(ctx) =>{
const msg = ctx.msg?.text ?? ''
var keys = new InlineKeyboard()
.text('Back To Panel', 'adminlogin');
console.log(msg)
if(msg.includes(',')){
var new_array = msg.split(',')
await ctx.reply('Channel Successfully added to database',{reply_markup: keys})
await bot_info.findOneAndUpdate({token: data.bot_token}, { channelsList: new_array}, {new: true, upsert: true})
ctx.session.step = 'idle'
}else if(msg.charAt(0) == '@'){
var new_array = [ msg ]
await ctx.reply('Channel Successfully added to database',{reply_markup: keys})
await bot_info.findOneAndUpdate({token: data.bot_token}, { channelsList: new_array}, {new: true, upsert: true})
ctx.session.step = 'idle'
}else{
   await ctx.reply('Invalid syntax!, make sure you add @ try again')
}

})

const manage = async(ctx, next) =>{

await ctx.deleteMessage()
ctx.reply('Hey Admin, you can add or remove a channel from the bot database here\n|nTo Add a channel send + before the Channel username\n|To Remove a channel send - before the channel Usename\n\nExample: +@demochannel or -@mydemovhannel')

ctx.session.step = 'manageChannel'

await next()

}

router.route('manageChannel', async(ctx) =>{
    const msg = ctx.msg?.text ?? ''
    let botdb = await bot_info.findOne({token: data.bot_token})
    var channel = botdb.channelsList
    console.log(channel)
    var keys = new InlineKeyboard()
.text('Back To Panel', 'adminlogin');

if(msg.charAt(0) == '+'){
    var new_msg = msg.substring(1)
var index = channel.indexOf(new_msg)
console.log(index)
if(index >= 0){
    ctx.reply('channel is already in database, send cancel to stop the process')
}else{

channel.push(new_msg)
var txt = 'Channel have been succesfully Added '
await ctx.reply(txt, {reply_markup: keys})
await bot_info.findOneAndUpdate({token: data.bot_token}, { channelsList: channel}, {new: true, upsert: true})
ctx.session.step = 'idle'
}
}else if(msg.charAt(0) == '-'){
    var new_msg = msg.substring(1)
    var index = channel.indexOf(new_msg)
    console.log(index)
    if(index < 0){
      await ctx.reply('Channel not found, send cancel to stop the process')
    }else{
    channel.splice(index, 1)
    var txt = 'Channel have been succesfully Removed'
    await ctx.reply(txt, {reply_markup: keys})
await bot_info.findOneAndUpdate({token: data.bot_token}, { channelsList: channel}, {new: true, upsert: true})
ctx.session.step = 'idle'
    }
}else if(msg == 'cancel'){
    await ctx.reply('operation cancel successfully', {reply_markup: keys})
    ctx.session.step = 'idle'
    
}else{
    ctx.reply('Invalid syntax please follow the syntax!')
} 
})

const removeAll = async(ctx, next) =>{

    var keys = new InlineKeyboard()
    .text('Back To Panel', 'adminlogin');

var channel = []

await ctx.editMessageText('All Channels have been succesfully Removed', {reply_markup: keys})
await bot_info.findOneAndUpdate({token: data.bot_token}, { channelsList: channel}, {new: true, upsert: true})

await next()
}
bot.use(router)
composer.callbackQuery('removeall', removeAll)

composer.callbackQuery('managechannel', manage)

composer.callbackQuery('channelset', chaStart)

composer.callbackQuery('addchannel', addChannel)

bot.use(composer)


