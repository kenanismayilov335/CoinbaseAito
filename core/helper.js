const collections = require('./database')
const data = require('../data')
const bot_info = collections('bot_info')
const users = collections('users')
const { findUser, mustJoin } = require('../handlers/channelHandler')

const helper = async(ctx, next) =>{
    let botdb = await bot_info.findOne({token: data.bot_token}).exec();
    if(!botdb){
        bot_info.create({
            token: data.bot_token,
            bot_name: data.bot_name,
            bot_cur: data.currency
        })
    }

    let user = await users.findOne({id: ctx.from.id})
    if(user){
        users.findOneAndUpdate({id: ctx.from.id}, {$set: {last_update: Date.now()}}).exec()
    }
    await next()
}

const userJoin = async (ctx, next) => {
    if (ctx.chat.type === 'private') {
 let joined = await findUser(ctx);
 if(!joined){
     mustJoin(ctx)
 }
    }
   await next()
}

module.exports ={
    helper,
    userJoin
}