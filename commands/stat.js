const { bot } = require('../core/bot');
const { Composer } = require('grammy');
const composer = new Composer()
const collections = require('../core/database');
const stats = collections('stat');
const users = collections('users');

const handler = async(ctx, next) => {
    ctx.api.sendChatAction(ctx.from.id, 'typing')
const botStat = await stats.findOne({id: 'newbot'})
const allUsers = await users.find({}).countDocuments()
if(botStat){
    let total_wd = botStat.total_withdrawn
    let time = new Date().toLocaleString();
   await ctx.reply('😎 *Total members:* `'+allUsers+'`\n🤑 *Total Payout*: `'+total_wd.toFixed(8)+'`\n⏰ *Server Time:* `'+time+'`',{parse_mode: 'markdown'})
}else{
   await ctx.reply('refreshing database')

    stats.create({
        id: 'newbot',
        total_withdrawn: 0
    })
}


await next()
}


composer.hears('📊 Stat', handler)

bot.use(composer)