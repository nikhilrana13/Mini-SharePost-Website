const express = require("express");
const app = express();
const userModel = require('./models/user');
const postModel = require('./models/post');
const path = require('path');
const cookieParsar = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = require("./models/user");


app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParsar());

app.post('/register', async function(req,res){
    const {username,name,email,age,password} = req.body;

    
   let user  = await userModel.findOne({email})
   if(user) return res.status(400).render('errors');

 
   bcrypt.genSalt(10, async (err,salt)=>{
    bcrypt.hash(password,salt, async (err,hash)=>{
        const user =  await userModel.create({
            username,
            name,
            email,
            age,
            password:hash
        })

        const token = jwt.sign({email,userid:user._id},'shhh')
        res.cookie('token',token)

        res.send('registered successfully');
    })
 
   })
      
})


app.get('/logout',function(req,res){
    res.clearCookie('token')
    res.redirect('/login')
})
app.get('/login',function(req,res){
    res.render('login')
})






app.get('/like/:id', isLoggedIn, async (req,res)=>{
    let post = await postModel.findOne({_id:req.params.id}).populate('user');
    const userId = req.user.userid;
    

       if(post.likes.includes(userId)){
          post.likes.pull(userId)
       } else{
          post.likes.push(userId)
       }
     await post.save();
      res.redirect('/profile')
  })


 app.post('/update/:id',isLoggedIn,async (req,res)=>{
    let post  = await postModel.findOneAndUpdate({_id:req.params.id},{content:req.body.content}).populate('user');
     
     res.redirect('/profile')


 })
  app.get('/edit/:id', isLoggedIn, async (req,res)=>{
    let post = await postModel.findOne({_id: req.params.id}).populate('user');
    
      res.render('edit',{post})
  })



app.post('/post',isLoggedIn , async function(req,res){
    let user = await userModel.findOne({email:req.user.email})
    let {content} = req.body;

    const post = await postModel.create({
        user:user._id,
        content
    })

    user.posts.push(post._id)
    await user.save()
    res.redirect('/profile')

})

app.get('/profile', isLoggedIn, async (req,res)=>{
  let user =   await userModel.findOne({email:req.user.email}).populate('posts');
//   console.log(user);

    res.render('profile',{user})
})


app.post('/login',async function(req,res){
    const {email,password} =req.body;

    const user = await userModel.findOne({email});
    if(!user) return res.status(400).send("something went wrong");

    const isMatch =  await bcrypt.compare(password,user.password);
    if(!isMatch) return res.status(400).send('invalid email or password');
    if(isMatch){
      
        const token = jwt.sign({email,userid:user._id},'shhh')
        res.cookie('token',token)
        res.status(200).redirect("/profile");
    } else{
        res.redirect('/login')
    }
    
})



function isLoggedIn(req, res, next) {
    // Check if token is empty or missing
    if (!req.cookies.token) {
        return res.status(401).redirect('/login');
    }

    try {
        // Verify the token and decode data
        const data = jwt.verify(req.cookies.token, 'shhh');
        req.user = data;
        // console.log('Decoded JWT Data:', data);
        req.user = data;  // Attach user data to request
        next();  // Call next middleware if everything is fine
    } catch (error) {
        // If there's an error verifying the token, respond with an error message
        return res.status(401).send('Invalid or expired token');
    }
}

app.get('/',function(req,res){
    res.render('index');
})


app.listen(3005);