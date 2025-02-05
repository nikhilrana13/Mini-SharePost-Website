const mongoose = require('mongoose');


    
    mongoose.connect('mongodb://localhost:27017/sharepost').then(()=>{
        console.log('Connected to MongoDB');
    }).catch((err)=>{
        console.log('Error connecting to MongoDB', err);
    })


    const postSchema =mongoose.Schema({
        user:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:'user'
            }
        ],
        content:String,
        likes:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:'user',
                default:[]
            }
        ]
      
    })
    
    module.exports = mongoose.model('post',postSchema);
  
       
    
  
