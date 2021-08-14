const mongoose = require('mongoose')
const { createConnection, Schema } = mongoose
const data = require('../data')

mongoose.connect('mongodb+srv://venom:queen123@cluster0.ttfek.gcp.mongodb.net/venomm?retryWrites=true&w=majority',{
dbName: 'Bot-With-Id-'+data.bot_token.split(':')[0],
useNewUrlParser: true,
useUnifiedTopology: true,
useCreateIndex: true,
useFindAndModify: false
}).then(() => {
    console.log('Db Connected')
}).catch(e => {
    console.log('Db Error', e)
})


const collections = [
    {
        name: 'users',
        schema: new Schema({
             id:{
            type: Number,
            required:true
          },
       username:{
            type: String,
            required: false
          },
       first_name:{
              type: String,
              required: true
            },
       last_name:{
              type: String,
              required: false
            },
       coinbase_mail:{
                type:String,
                required: false,
                default: 'not set'
              },
       last_update:{
              type: Date,
              default: () => Date.now()
            }
    })
},{
    name: 'bonus',
    schema: new Schema({
        id:{
            type: Number,
            required:true
          },
        bonus_time: {
            type: Date,
            required:false
      },
    })
},
    {
        name: 'balances',
        schema: new Schema({
            id:{
                type: Number,
                required:true
              },
            balance:{
                type: Number,
                required: true,
                default: 0
              },
              withdrawn:{
                type: Number,
                required: true,
                default: 0
              },
            total_earned:{
                type: Number,
                required: false,
                default: 0
            }
        })
    },
  {
      name: 'referData',
      schema: new Schema({
        id:{
            type: Number,
            required:true
          },
    refferal_id:{
            type: Number,
            required: false
        },
     paid_for_refer:{
            type: String,
            required: false,
            default: 'nope'
        },
        ref_count:{
        type: Number,
        required: false,
        default: 0
        },
         invited_users:{
            type:[],
            required: false,
            default:[]
        }
      })
  },{
      name: 'stat',
      schema: new Schema({
          id:{
              type: String,
              required: true
          },
          total_withdrawn: {
              type: Number,
              required: true
          }
      })
  },
  {
    name: 'broadcast',
    schema: new Schema({
        id:{
            type: String,
            required: true
        },
        broadcast_status: {
            type: String,
            required: true
        }
    })
},
  {
    name:'bot_info',
    schema:  new Schema({
        token:{
            type: String,
            required: true
        },
        bot_name:{
            type: String,
            required: true,
            default:'Demo_Invite_Bot'
        },
        bot_cur:{
            type: String,
            required: true
        },
        channelsList:{
            type:[ String ],
            required: false,
            default: []
        },
        min_wd:{
            type: Number,
            required: false,
            default: 0
        },
        reffer_bonus:{
            type: Number,
            required: false,
            default: 0
        },
        daily_bonus:{
            type: Number,
            required: false,
            default: 0
        },
        coinbase_api:{
         type: String,
         required: false,
         default: 'not set'
        },
        coinbase_api_secret:{
            type: String,
            required: false,
            default: 'not set'
           },
        payment_channel:{
            type: String,
            required: false,
            default: 'not set'
        },
        keyboard:{
            type: String,
            required: false,
            default: 'not set'
        },
        start_msg:{
            type: String,
            required: false,
            default: 'not set'
        },
        payout_msg:{
            type: String,
            required: false,
            default: 'not set'
        },
        ref_not_msg:{
            type: String,
            required: false,
            default: 'not set'
        },
        bonus_msg:{
            type: String,
            required: false,
            default: 'not set'
        },
        more_msg:{
            type: String,
            required: false,
            default: 'not set'
    }
    })
},
{
  name: 'settings',
  schema: new Schema({
      key: String,
      value: Schema.Types.Mixed
  })
}
]
collections.reverse().forEach(collection =>{
    if(collection.pre){
        Object.keys(collection.pre).forEach(preKey => {
            collection.schema.pre(preKey, collection.pre[preKey])
        })
    }
    if(collection.method){
        collection.schema.method(collection.method)
    }
    if(collection.virtual){
        Object.keys(collection.virtual).forEach(virtual => {
            collection.schema.virtual(virtual, collection.virtual[virtual])
        })
    }
    mongoose.model(collection.name, collection.schema)
})

module.exports = collectionName => {
    const collection = collections.find(el => el.name === collectionName)
    if(collection){
        return mongoose.model(collection.name, collection.schema)
    }else{
        throw new Error('Collection not Found')
    }
}















