const { bot } = require('../core/bot');
const { Composer } = require('grammy');
const composer = new Composer()
const collections = require('../core/database');
const { findUser, mustJoin } = require('../handlers/channelHandler')
const balances = collections('balances');
const bot_info = collections('bot_info')
const data = require('../data')

const handler = async(ctx, next) => {
    var userBals = await balances.findOne({id: ctx.from.id})
    let botdb = await bot_info.findOne({token: data.bot_token})
    let cur = botdb.bot_cur
    if(userBals){
    ctx.reply('💰 *Your Account Balance: * \n\n_'+userBals.balance.toFixed(8)+' '+cur+'_', {parse_mode: 'markdown'})
    }else{
        let inChannel = await findUser(ctx)
if(inChannel){

    await balances.create({
        id: ctx.from.id,
        balance: 0,
        withdrawn: 0,
        total_earned: 0
    })
    }else{
 await mustJoin(ctx)
    }
    
}
next()
}

composer.hears('💵 Balance', handler)
bot.use(composer)