
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/sharepost').then(()=>{
  console.log('Connected to MongoDB')
}).catch((err)=>{
  console.log('Error connecting to MongoDB', err)
})

  
    
    const userSchema = mongoose.Schema({
        username:String,
        email:String,
        password:String,
        posts:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:'post'
            }
    ]})

    
    module.exports = mongoose.model('user',userSchema);
 


