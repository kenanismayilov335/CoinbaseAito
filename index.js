const express = require('express')
const app = express()

app.get('/', function(req,res){
    res.send('hello world')
})

app.listen('8080', ()=>{
    console.log('Bot is Starting....... 🔁');
    require('./commands/index')
    require('./admin/index')
})