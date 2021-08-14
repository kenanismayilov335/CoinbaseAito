const collections = require('../core/database')
const bot_info = collections('bot_info')
const data = require('../data')



async function findUser(ctx){
let botdb = await bot_info.findOne({token: data.bot_token})
var cha = botdb.channelsList
if(!botdb || cha.length === 0){
    return true
}else{
let isInChannel = true
console.log(cha)
for (let i = 0; i < cha.length; i++){
var chat = cha[i];
let tgData = await ctx.api.getChatMember(chat, ctx.from.id)
const sub = ['creator', 'adminstator', 'member'].includes(tgData.status)
if(!sub){
    isInChannel = false;
    break;
}
}
return isInChannel
}
 
}

var mustJoin = async (ctx) => {
let msg = '<b>⛔ You Must Join All Channels</b>\n'
let botdb = await bot_info.findOne({token: data.bot_token})
let channels = botdb.channelsList
for(var ind in channels){
var cha = channels[ind];
msg+='\n'+cha
}
msg+='<b>\n\n✅ Click the Button Below To Continue</b>'
await ctx.api.raw.sendMessage({
    chat_id:ctx.from.id,
    text: msg,
    parse_mode:'html',
    reply_markup:{keyboard: [['✅ Joined']], resize_keyboard:true}
})
}


module.exports ={
findUser,
mustJoin,
}



