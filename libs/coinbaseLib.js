const collections = require('../core/database')
const bot_info = collections('bot_info')
const data = require('../data')

const Client = require('coinbase').Client


var createClient = async() => {
let keys = await loadKeys()
let api = keys.apiKey
let secret = keys.secretKey
try {
var client = new Client({
    apiKey: api,
    apiSecret: secret,
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

var loadAccount_id = async() => {
    var client = await createClient()
    var account;
    client.getAccount({}, function(err, accounts){
        if(err){
            throw new Error(err)
        }
for(var ind in accounts){
account = accounts[ind]
if(account.currecy.code == data.currency){ break }
    }
    })

    return account.id
}

var create_witdrawal = async(amount, wallet, cur, bot_name) =>{
var client = await createClient()
var account = await loadAccount_id()

client.getAccount(data.cb_account_id, function(err, account){

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
