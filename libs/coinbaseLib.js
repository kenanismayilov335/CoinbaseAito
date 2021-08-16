const collections = require('../core/database')
const bot_info = collections('bot_info')
const data = require('../data')

const cb_api = '2xYpvx5P4h1cq5Hy'
const cb_api_secret = 'iCtb37ODTWccARgYFa6lp4Y1wH9wa8lJ'
const cb_account_id = '88e9e3e1-3b93-57b2-adca-faf0a9d9bdee'

const Client = require('coinbase').Client


var createClient = async() => {
let keys = await loadKeys()
let api = keys.apiKey
let secret = keys.secretKey
try {
var client = new Client({
    apiKey: cb_api,
    apiSecret: cb_api_secret,
    strictSSL: false
});
return client
} catch(e){
throw new Error(e)
}
}

var loadKeys = async() => {
    var api, secret
    let botdb = await bot_info.findOne({token: data.bot_token})

    if(!botdb){
throw new Error('bot database not set')
    }else if(!botdb.coinbase_api && !botdb.coinbase_api_secret){
throw new Error('bot database not set')      
    }else{
         api = botdb.coinbase_api
        secret = botdb.coinbase_api_secret
    }

    return { apiKey: api, secretKey: secret}
}

var create_witdrawal = async(amount, wallet, cur, bot_name) =>{
var client = await createClient()
client.getAccount(cb_account_id, function(err, account){

var args = {
    'to':wallet,
    'amount': amount,
    'currency': cur,
    'description': 'Auto payment from @'+bot_name
}
account.sendMoney(args, function(err, txn){
    if(err){
        throw new Error(err)
    }
});
});

}

module.exports ={
    create_witdrawal,
    loadKeys,
    createClient
}