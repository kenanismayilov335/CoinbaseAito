
const { Keyboard } = require('grammy');
const collections = require('../core/database');
const bot_info = collections('bot_info');
const data = require('../data')

async function createMenu(ctx, item){
let botdb = await bot_info.findOne({token: data.bot_token});

if((!botdb.min_wd) | (!botdb.reffer_bonus) | (!botdb.daily_bonus)){
         
         await ctx.reply('Set up admin panel with /adminlogin')
          }else{
    var keys = new Keyboard()
       .text('💵 Balance').row()
       .text('👨‍👩‍👧‍👦 Reffer').text('🎁 Bonus').text('💰 Withdraw').row()
       .text('📊 Stat').text('🗳 Wallet')
    switch (item) {
        case 'start':
        ctx.reply(textFormat('Welcome {fullname} to bot',ctx.from),{reply_markup:{  keyboard: keys.build(), resize_keyboard: true},parse_mode: 'markdown'})
            break;
        default:
            replyWithMarkdown(textFormat('Welcome {fullname} to bot',from))
    }
          }
}


function keyFormat(keyText){
    var newKey = false;
    if(keyText.includes('\n')){
        var oldArray = keyText.split('\n')
        .map(
            s => s.split(',')
            );
        newKey = oldArray.filter(
            function(x) {
            return x!=null && x!='undefined' && x!=''
        }
        )
    }
    return newKey
}

function textFormat(text, user){
    var newText = false;
    if(text){
var first_name = user.first_name
var id = user.id
var full_name = user.last_name? first_name+' '+user.last_name : first_name
var username = user.username? username : first_name
var time = new Date().toLocaleString('en-US', {timezone:'Africa/Accra'})
var mention_id = '['+id+']('+'tg://user?id='+id+')'
var mention_name = '['+username+']('+'tg://user?id='+id+')'
var lang = {
    'mention_name':mention_name,
    'mention_id':mention_id,
    'username':username,
    'userid':id,
    'time':time,
    'fullname':full_name,
    'first_name':first_name
}
newText = text.replace(/{([a-z_]+)}/gi,function(fullmatch, key){return lang[key]? lang[key] : fullmatch
});
    }

    return newText
}


module.exports ={
createMenu,
textFormat,
keyFormat
}
