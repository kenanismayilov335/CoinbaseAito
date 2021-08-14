const { bot } = require('../core/bot');
const { Composer } = require('grammy');
const composer = new Composer()
const { createMenu } = require('../handlers/menuHandler');
const { textFormat } = require('../handlers/errorHandler');
const collections = require('../core/database')
const referData = collections('referData')
const users = collections('users')
const balances = collections('balances')
const bot_info = collections('bot_info')
const data = require('../data')
const { findUser, mustJoin } = require('../handlers/channelHandler')






const starter = async (ctx, next) => {
    try {
      let isJoined = await findUser(ctx)
        let botdb = await bot_info.findOne({token: data.bot_token});
        if((!botdb.min_wd) | (!botdb.reffer_bonus) | (!botdb.daily_bonus)){
         
         await ctx.reply('Set up admin panel with /adminlogin')
        }else{
        let query = ctx.match ? ctx.match*1 : false;

        if (ctx.chat.type === 'private') {
        const user = await users.findOne({id: ctx.from.id}).exec()
        const userRefs = await referData.findOne({id: ctx.from.id})    
        if(user){
            if(isJoined){
    await createMenu(ctx, "start");
            }else{
                mustJoin(ctx)
            }
}else{
if(query && ctx.from.id != query && !userRefs){
      await  referData.create({
            id: ctx.from.id,
            refferal_id: query
        })
        
    const newUser = await referData.findOne({ id: query})
    const ref_count = newUser.ref_count +1
    await referData.findOneAndUpdate({id: query}, {$set: {ref_count: ref_count}})
   if(newUser){
       if(newUser.invited_users.some(el => el.user_id != ctx.from.id)){
           let user_list = newUser.invited_users
           user_list.push({
               user_id: ctx.from.id
           })
           await referData.findOneAndUpdate({id: query}, {$set: {invited_users: user_list}})
       }
}}
await users.create({
    id: ctx.from.id,
    username: ctx.from.username,
    first_name: ctx.from.first_name,
    last_name: ctx.from.last_name,
})

await  referData.create({
    id: ctx.from.id
})

await balances.create({
    id: ctx.from.id,
    balance: 0,
    withdrawn: 0,
    total_earned: 0
}) 

if(isJoined){

    const duserRefs = await referData.findOne({id: ctx.from.id})
    if(duserRefs && duserRefs.refferal_id && duserRefs.paid_for_refer == 'nope'){
    let bal = await balances.findOne({id: duserRefs.refferal_id})
    console.log(bal)
    if(bal){
       let botdb = await bot_info.findOne({token: data.bot_token})
       let bb = bal.balance+botdb.reffer_bonus
       console.log(bb)
       await balances.findOneAndUpdate({id: duserRefs.refferal_id} ,{$set: { balance: bb}}).exec()
       let text = '➕ *You earned '+botdb.reffer_bonus+' '+botdb.bot_cur+' from a refferal*'
     await ctx.api.sendMessage(duserRefs.refferal_id,text,{parse_mode: 'markdown'})
     await referData.findOneAndUpdate({id: ctx.from.id} ,{$set: { paid_for_refer: 'yeah'}}, {upsert: true}).exec()
    }
    }
    await createMenu(ctx, "start");
            }else{
                mustJoin(ctx)
            }

}
          }  }
    } catch(e){
   ctx.reply('Error Happened - '+e.message) 
}
    await next()
}
composer.command('start', starter);
bot.use(composer)
