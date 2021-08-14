const { bot } = require('../core/bot');
const { Composer } = require('grammy');
const composer = new Composer()
const collections = require('../core/database');
const referData = collections('referData')
const bot_info = collections('bot_info')
const data = require('../data')


const handler = async(ctx, next) => {
try{
    const userRefs = await referData.findOne({id: ctx.from.id})
    let botdb = await bot_info.findOne({token: data.bot_token})
    let invited = userRefs.invited_users
    let total_invited = invited.length
    let cur = botdb.bot_cur
    let ref_bonus = botdb.reffer_bonus

    ctx.reply('<b>👥 You Invited: </b>'+total_invited+' referrals\n<b>🔗 Your referral link:</b> https://t.me/'+data.bot_name+'?start=' + ctx.from.id +'\n\n💰 <b>Per Referral '+ref_bonus+' '+cur+'</b> - <i>Share Your referral link to your Friends & earn unlimited '+cur+'</i>\n\n⚠️ <b>Note</b>\n<i>Fake, empty or spam users are deleted after checking.</i>',  {parse_mode: 'html'})
    } catch(e){
   ctx.reply('Error Happened - '+e.message) 
}
await next()
}


composer.hears('👨‍👩‍👧‍👦 Reffer', handler)

bot.use(composer)