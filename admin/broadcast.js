const { bot } = require('../core/bot');
const { Composer, InlineKeyboard } = require('grammy');
const composer = new Composer()
const collections = require('../core/database');
const users = collections('users');
const broadstat = collections('broadcast')
const { Router } = require('@grammyjs/router')
const router = new Router((ctx) => ctx.session.step);
const data = require('../data')

const Broadcaster = require('../broadcaster/broadcaster')

const broadcaster = new Broadcaster(bot)

const broad = async(ctx, next) => {
let botUsage = await broadstat.findOne({id: 'newbot'})
if(botUsage){
    status = botUsage.broadcast_status
}else{
    status = 'Inactive'
    broadstat.create({
        id: 'newbot',
        broadcast_status: 'Inactive'
    })
}
if(status == 'Inactive'){
var button = new InlineKeyboard()
    .text('📢 Broadcast Message', 'broadmsg').row()
    .text('🔙 Return To Panel', 'adminlogin')
}else if(status == 'Paused'){
var button = new InlineKeyboard()
   .text('📊 Broadcast Status', 'broadcaststatus').row()
   .text('▶ Start Broadcast', 'broadcast')
   .text('⏏ Cancel Broadcast', 'cancelbroad').row()
   .text('🔙 Return To Panel', 'adminlogin')
}else{
    var button = new InlineKeyboard()
    .text('📊 Broadcast Status', 'broadcaststatus').row()
    .text('⏸ Pause Broadcast', 'pbroadcast')
    .text('⏏ Cancel Broadcast', 'cancelbroad').row()
   .text('🔙 Return To Panel', 'adminlogin')
 }

await ctx.editMessageText('*👮‍♂️ Welcome To the Broadcasting Section*\n\n♻ *Broadcast Status:* `'+status+'`\n*Choose what you want to do below*', {reply_markup: button, parse_mode: 'markdown'})

await next()
}

const cancelBroad = async(ctx, next) =>{
const { failedCount, completedCount, waitingCount } = await broadcaster.status()
let totalUsers = await users.find({}).countDocuments()
var button = new InlineKeyboard()
    .text('Return To Panel', 'adminlogin')
ctx.editMessageText('<b>⛔ Broadcasting Is been terminated</b>\n\n<b>Broadcasting Canceled\nInformation About Broadcast</b>\n<code>'+
     `total user: ${totalUsers} \n` +
     `pending: ${waitingCount} \n` +
     `failed: ${failedCount} \n` +
     `completed: ${completedCount}` +
     '</code>',{reply_markup: button, parse_mode: 'html'})

broadcaster.terminate()
broadcaster.reset()

await broadstat.findOneAndUpdate({id: 'newbot'} ,{$set: { broadcast_status: 'Inactive'}}).exec()

await next()
}

const broadstart = async(ctx, next) =>{
broadcaster.resume()
var button = new InlineKeyboard()
    .text('📊 Broadcast Status', 'broadcaststatus').row()
    .text('⏸ Pause Broadcast', 'pbroadcast')
    .text('⏏ Cancel Broadcast', 'cancelbroad').row()
   .text('🔙 Return To Panel', 'adminlogin')
await ctx.editMessageText('*🔜 Broadcasting Started...*\n\n_Choose what you will like to do next._',{reply_markup: button, parse_mode: 'markdown'})

await next()
}

const broadPaused = async(ctx, next) =>{
    broadcaster.pause()
    var button = new InlineKeyboard()
    .text('📊 Broadcast Status', 'broadcaststatus').row()
    .text('▶ Start Broadcast', 'broadcast')
    .text('⏏ Cancel Broadcast', 'cancelbroad').row()
    .text('🔙 Return To Panel', 'adminlogin')
    await ctx.editMessageText('*🔚 Broadcasting Paused...*\n\n_Choose what you will like to do next._',{reply_markup: button, parse_mode: 'markdown'})

    await next()
}

const broadstatus = async(ctx, next) =>{
    const { failedCount, completedCount, waitingCount } = await broadcaster.status()
    var button = new InlineKeyboard()
    .text('🔙 Return To Panel', 'adminlogin')
let totalUsers = await users.find({}).countDocuments()
ctx.editMessageText('<b>ℹ Information About Broadcast</b>\n<code>'+
`total user: ${totalUsers} \n` +
`pending: ${waitingCount} \n` +
`failed: ${failedCount} \n` +
`completed: ${completedCount}` +
'</code>',
     {reply_markup: button, parse_mode: 'html'})


     await next()
}

broadcaster.onCompleted(async ()=> {
let totalUsers = await users.find({}).countDocuments()
const { failedCount, completedCount, waitingCount } = await broadcaster.status()
    const msg = '<b>✅ Broadcasting Ended</b>\n\n<b>ℹ Information About Broadcast</b>\n<code>'+
    `total user: ${totalUsers} \n` +
    `pending: ${waitingCount} \n` +
    `failed: ${failedCount} \n` +
    `completed: ${completedCount}` +
    '</code>'
await broadstat.findOneAndUpdate({id: 'newbot'} ,{$set: { broadcast_status: 'Inactive'}}).exec()
    await bot.api.sendMessage(data.admin,msg,{parse_mode: 'HTML'})

})



const broadCast = async(ctx, next) =>{
await ctx.editMessageText('*👮‍♂️ Okay Admin, Send Me The Message You want To broadcast*', {parse_mode: 'markdown'})
ctx.session.step = 'broadcast'

await next()
}

router.route('broadcast', async(ctx)=>{
    const msg = ctx.msg?.text ?? ''
    let totalUsers = await users.find({})
    if(msg.length>3000){
ctx.reply('Type In the message you want to send to your users. it must not exceed 3000 characters')
    }else{
    let userToBroad = totalUsers.map(user => user.id)
    broadcaster.pause()

    broadcaster.sendMessage(userToBroad, msg, {parse_mode: 'markdown'})
    await broadstat.findOneAndUpdate({id: 'newbot'} ,{$set: { broadcast_status: 'Paused'}}).exec()
var button = new InlineKeyboard()
    .text('📊 Broadcast Status', 'broadcaststatus').row()
    .text('▶ Start Broadcast', 'broadcast')
    .text('⏏ Cancel Broadcast', 'cancelbroad').row()
    .text('🔙 Return To Panel', 'adminlogin')

    await ctx.reply('*🔜 Broadcasting Queued...*\n\n_Choose what you will like to do next._',{reply_markup: button, parse_mode: 'markdown'})
   ctx.session.step = 'idle'
   
  
    }

})
composer.callbackQuery('broadcastnow', broad)
composer.callbackQuery('broadcast', broadstart)
composer.callbackQuery('broadmsg', broadCast)
composer.callbackQuery('cancelbroad', cancelBroad)
composer.callbackQuery('broadcaststatus', broadstatus)
composer.callbackQuery('pbroadcast', broadPaused)

bot.use(router)
bot.use(composer)